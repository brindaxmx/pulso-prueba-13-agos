#!/usr/bin/env python3
"""
Script para evaluar modelos especializados en producción
Incluye detección de drift, análisis de rendimiento y recomendaciones
"""

import os
import json
import logging
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Any, Tuple
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix, roc_auc_score
from scipy import stats
import psycopg2
from psycopg2.extras import RealDictCursor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ModelEvaluator:
    """Evaluador de modelos especializados en producción"""
    
    def __init__(self):
        self.db_connection = self._connect_to_database()
        
    def _connect_to_database(self):
        """Conectar a la base de datos"""
        return psycopg2.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            database=os.getenv('DB_NAME', 'pulso'),
            user=os.getenv('DB_USER', 'postgres'),
            password=os.getenv('DB_PASSWORD', ''),
            cursor_factory=RealDictCursor
        )
    
    def evaluate_model_performance(self, model_id: str, days_back: int = 30) -> Dict[str, Any]:
        """Evaluar rendimiento de un modelo específico"""
        
        with self.db_connection.cursor() as cursor:
            # Obtener información del modelo
            cursor.execute("""
                SELECT sam.*, vc.category_name, vc.evaluation_criteria
                FROM specialized_ai_models sam
                LEFT JOIN verification_categories vc ON sam.verification_category = vc.category_name
                WHERE sam.id = %s
            """, (model_id,))
            
            model_info = cursor.fetchone()
            if not model_info:
                raise ValueError(f"Model {model_id} not found")
            
            # Obtener verificaciones recientes
            cursor.execute("""
                SELECT av.*, sf.expert_score, sf.detailed_feedback
                FROM ai_verifications av
                LEFT JOIN specialized_feedback sf ON av.id = sf.verification_id
                WHERE av.verification_type = %s
                AND av.created_at >= NOW() - INTERVAL '%s days'
                ORDER BY av.created_at DESC
            """, (model_info['verification_category'], days_back))
            
            verifications = cursor.fetchall()
        
        if not verifications:
            return {'error': 'No verification data found for evaluation'}
        
        # Calcular métricas
        metrics = self._calculate_performance_metrics(verifications)
        
        # Análisis de drift
        drift_analysis = self._detect_performance_drift(verifications)
        
        # Análisis de errores
        error_analysis = self._analyze_prediction_errors(verifications)
        
        # Recomendaciones
        recommendations = self._generate_recommendations(metrics, drift_analysis, error_analysis)
        
        return {
            'model_info': dict(model_info),
            'evaluation_period': {
                'days': days_back,
                'total_predictions': len(verifications),
                'with_feedback': len([v for v in verifications if v['expert_score'] is not None])
            },
            'performance_metrics': metrics,
            'drift_analysis': drift_analysis,
            'error_analysis': error_analysis,
            'recommendations': recommendations,
            'evaluation_timestamp': datetime.now().isoformat()
        }
    
    def _calculate_performance_metrics(self, verifications: List[Dict]) -> Dict[str, Any]:
        """Calcular métricas de rendimiento"""
        
        # Filtrar verificaciones con feedback experto
        with_feedback = [v for v in verifications if v['expert_score'] is not None]
        
        if not with_feedback:
            return {'error': 'No expert feedback available for metric calculation'}
        
        # Extraer scores
        ai_scores = [v['ai_result']['score'] if v['ai_result'] and 'score' in v['ai_result'] else 0 
                    for v in with_feedback]
        expert_scores = [v['expert_score'] for v in with_feedback]
        
        # Convertir a clasificación binaria (pass/fail)
        ai_predictions = [1 if score >= 80 else 0 for score in ai_scores]
        expert_labels = [1 if score >= 80 else 0 for score in expert_scores]
        
        # Métricas básicas
        accuracy = accuracy_score(expert_labels, ai_predictions)
        precision, recall, f1, _ = precision_recall_fscore_support(
            expert_labels, ai_predictions, average='binary', zero_division=0
        )
        
        # Correlación de scores
        score_correlation = np.corrcoef(ai_scores, expert_scores)[0, 1] if len(ai_scores) > 1 else 0
        
        # Métricas de confianza
        confidences = [v['confidence_score'] for v in with_feedback]
        avg_confidence = np.mean(confidences)
        
        # Análisis por rangos de confianza
        high_conf_mask = np.array(confidences) >= 0.9
        med_conf_mask = (np.array(confidences) >= 0.7) & (np.array(confidences) < 0.9)
        low_conf_mask = np.array(confidences) < 0.7
        
        confidence_analysis = {
            'high_confidence': {
                'count': np.sum(high_conf_mask),
                'accuracy': accuracy_score(
                    np.array(expert_labels)[high_conf_mask], 
                    np.array(ai_predictions)[high_conf_mask]
                ) if np.sum(high_conf_mask) > 0 else 0
            },
            'medium_confidence': {
                'count': np.sum(med_conf_mask),
                'accuracy': accuracy_score(
                    np.array(expert_labels)[med_conf_mask], 
                    np.array(ai_predictions)[med_conf_mask]
                ) if np.sum(med_conf_mask) > 0 else 0
            },
            'low_confidence': {
                'count': np.sum(low_conf_mask),
                'accuracy': accuracy_score(
                    np.array(expert_labels)[low_conf_mask], 
                    np.array(ai_predictions)[low_conf_mask]
                ) if np.sum(low_conf_mask) > 0 else 0
            }
        }
        
        return {
            'accuracy': round(accuracy, 4),
            'precision': round(precision, 4),
            'recall': round(recall, 4),
            'f1_score': round(f1, 4),
            'score_correlation': round(score_correlation, 4),
            'average_confidence': round(avg_confidence, 4),
            'confidence_analysis': confidence_analysis,
            'confusion_matrix': confusion_matrix(expert_labels, ai_predictions).tolist(),
            'sample_size': len(with_feedback)
        }
    
    def _detect_performance_drift(self, verifications: List[Dict]) -> Dict[str, Any]:
        """Detectar drift en el rendimiento del modelo"""
        
        # Ordenar por fecha
        verifications_sorted = sorted(verifications, key=lambda x: x['created_at'])
        
        # Dividir en períodos
        mid_point = len(verifications_sorted) // 2
        early_period = verifications_sorted[:mid_point]
        recent_period = verifications_sorted[mid_point:]
        
        # Calcular métricas para cada período
        early_metrics = self._calculate_period_metrics(early_period)
        recent_metrics = self._calculate_period_metrics(recent_period)
        
        # Detectar cambios significativos
        drift_detected = False
        significant_changes = []
        
        for metric in ['accuracy', 'confidence', 'score_correlation']:
            if metric in early_metrics and metric in recent_metrics:
                early_val = early_metrics[metric]
                recent_val = recent_metrics[metric]
                
                if abs(recent_val - early_val) > 0.05:  # Umbral de 5%
                    drift_detected = True
                    significant_changes.append({
                        'metric': metric,
                        'early_value': early_val,
                        'recent_value': recent_val,
                        'change': recent_val - early_val,
                        'change_percentage': ((recent_val - early_val) / early_val * 100) if early_val != 0 else 0
                    })
        
        return {
            'drift_detected': drift_detected,
            'early_period': {
                'count': len(early_period),
                'metrics': early_metrics
            },
            'recent_period': {
                'count': len(recent_period),
                'metrics': recent_metrics
            },
            'significant_changes': significant_changes,
            'drift_magnitude': max([abs(c['change']) for c in significant_changes]) if significant_changes else 0
        }
    
    def _calculate_period_metrics(self, verifications: List[Dict]) -> Dict[str, float]:
        """Calcular métricas para un período específico"""
        
        with_feedback = [v for v in verifications if v['expert_score'] is not None]
        
        if not with_feedback:
            return {}
        
        ai_scores = [v['ai_result']['score'] if v['ai_result'] and 'score' in v['ai_result'] else 0 
                    for v in with_feedback]
        expert_scores = [v['expert_score'] for v in with_feedback]
        confidences = [v['confidence_score'] for v in with_feedback]
        
        ai_predictions = [1 if score >= 80 else 0 for score in ai_scores]
        expert_labels = [1 if score >= 80 else 0 for score in expert_scores]
        
        return {
            'accuracy': accuracy_score(expert_labels, ai_predictions) if len(expert_labels) > 0 else 0,
            'confidence': np.mean(confidences) if confidences else 0,
            'score_correlation': np.corrcoef(ai_scores, expert_scores)[0, 1] if len(ai_scores) > 1 else 0
        }
    
    def _analyze_prediction_errors(self, verifications: List[Dict]) -> Dict[str, Any]:
        """Analizar patrones en los errores de predicción"""
        
        with_feedback = [v for v in verifications if v['expert_score'] is not None]
        
        if not with_feedback:
            return {'error': 'No feedback data for error analysis'}
        
        errors = []
        for v in with_feedback:
            ai_score = v['ai_result']['score'] if v['ai_result'] and 'score' in v['ai_result'] else 0
            expert_score = v['expert_score']
            error = abs(ai_score - expert_score)
            
            errors.append({
                'verification_id': v['id'],
                'ai_score': ai_score,
                'expert_score': expert_score,
                'error': error,
                'confidence': v['confidence_score'],
                'created_at': v['created_at'],
                'feedback': v.get('detailed_feedback', {})
            })
        
        # Análisis estadístico de errores
        error_values = [e['error'] for e in errors]
        
        # Identificar outliers
        q75, q25 = np.percentile(error_values, [75, 25])
        iqr = q75 - q25
        outlier_threshold = q75 + 1.5 * iqr
        outliers = [e for e in errors if e['error'] > outlier_threshold]
        
        # Patrones comunes en errores grandes
        large_errors = [e for e in errors if e['error'] > 20]  # Errores > 20 puntos
        
        common_patterns = self._identify_error_patterns(large_errors)
        
        return {
            'total_errors': len(errors),
            'mean_absolute_error': np.mean(error_values),
            'median_absolute_error': np.median(error_values),
            'std_error': np.std(error_values),
            'max_error': np.max(error_values),
            'outliers': {
                'count': len(outliers),
                'threshold': outlier_threshold,
                'examples': outliers[:3]  # Primeros 3 outliers
            },
            'large_errors': {
                'count': len(large_errors),
                'percentage': len(large_errors) / len(errors) * 100,
                'common_patterns': common_patterns
            },
            'error_distribution': {
                'q25': np.percentile(error_values, 25),
                'q50': np.percentile(error_values, 50),
                'q75': np.percentile(error_values, 75),
                'q90': np.percentile(error_values, 90)
            }
        }
    
    def _identify_error_patterns(self, large_errors: List[Dict]) -> List[Dict]:
        """Identificar patrones comunes en errores grandes"""
        
        patterns = []
        
        if not large_errors:
            return patterns
        
        # Patrón 1: Errores con alta confianza (falsos positivos del modelo)
        high_conf_errors = [e for e in large_errors if e['confidence'] > 0.8]
        if high_conf_errors:
            patterns.append({
                'pattern': 'high_confidence_errors',
                'description': 'Errores grandes con alta confianza del modelo',
                'count': len(high_conf_errors),
                'avg_error': np.mean([e['error'] for e in high_conf_errors]),
                'avg_confidence': np.mean([e['confidence'] for e in high_conf_errors])
            })
        
        # Patrón 2: Sobreestimación sistemática
        overestimations = [e for e in large_errors if e['ai_score'] > e['expert_score']]
        if len(overestimations) > len(large_errors) * 0.6:  # Más del 60%
            patterns.append({
                'pattern': 'systematic_overestimation',
                'description': 'El modelo tiende a sobreestimar la calidad',
                'count': len(overestimations),
                'avg_overestimation': np.mean([e['ai_score'] - e['expert_score'] for e in overestimations])
            })
        
        # Patrón 3: Subestimación sistemática
        underestimations = [e for e in large_errors if e['ai_score'] < e['expert_score']]
        if len(underestimations) > len(large_errors) * 0.6:
            patterns.append({
                'pattern': 'systematic_underestimation',
                'description': 'El modelo tiende a subestimar la calidad',
                'count': len(underestimations),
                'avg_underestimation': np.mean([e['expert_score'] - e['ai_score'] for e in underestimations])
            })
        
        return patterns
    
    def _generate_recommendations(self, metrics: Dict, drift_analysis: Dict, error_analysis: Dict) -> List[Dict]:
        """Generar recomendaciones basadas en el análisis"""
        
        recommendations = []
        
        # Recomendaciones basadas en métricas
        if metrics.get('accuracy', 0) < 0.8:
            recommendations.append({
                'priority': 'high',
                'category': 'performance',
                'title': 'Precisión Baja Detectada',
                'description': f"La precisión del modelo ({metrics['accuracy']:.2%}) está por debajo del umbral aceptable (80%)",
                'actions': [
                    'Reentrenar el modelo con datos adicionales',
                    'Revisar y mejorar la calidad de las anotaciones',
                    'Considerar ajustar los umbrales de decisión'
                ]
            })
        
        if metrics.get('score_correlation', 0) < 0.7:
            recommendations.append({
                'priority': 'medium',
                'category': 'calibration',
                'title': 'Baja Correlación con Expertos',
                'description': f"La correlación con puntuaciones de expertos ({metrics['score_correlation']:.3f}) es baja",
                'actions': [
                    'Revisar criterios de evaluación con expertos',
                    'Implementar calibración de puntuaciones',
                    'Aumentar diversidad en datos de entrenamiento'
                ]
            })
        
        # Recomendaciones basadas en drift
        if drift_analysis.get('drift_detected', False):
            recommendations.append({
                'priority': 'high',
                'category': 'drift',
                'title': 'Degradación de Rendimiento Detectada',
                'description': f"Se detectó drift con magnitud {drift_analysis['drift_magnitude']:.3f}",
                'actions': [
                    'Programar reentrenamiento inmediato',
                    'Investigar cambios en los datos de entrada',
                    'Implementar monitoreo continuo más frecuente'
                ]
            })
        
        # Recomendaciones basadas en errores
        if error_analysis.get('large_errors', {}).get('percentage', 0) > 15:
            recommendations.append({
                'priority': 'medium',
                'category': 'error_reduction',
                'title': 'Alto Porcentaje de Errores Grandes',
                'description': f"{error_analysis['large_errors']['percentage']:.1f}% de predicciones tienen errores >20 puntos",
                'actions': [
                    'Analizar casos de error para identificar patrones',
                    'Mejorar preprocesamiento de datos',
                    'Considerar ensemble de modelos'
                ]
            })
        
        # Recomendaciones basadas en patrones de error
        for pattern in error_analysis.get('large_errors', {}).get('common_patterns', []):
            if pattern['pattern'] == 'high_confidence_errors':
                recommendations.append({
                    'priority': 'medium',
                    'category': 'confidence_calibration',
                    'title': 'Errores con Alta Confianza',
                    'description': 'El modelo muestra alta confianza en predicciones incorrectas',
                    'actions': [
                        'Implementar calibración de confianza',
                        'Revisar arquitectura del modelo',
                        'Añadir regularización para reducir overconfidence'
                    ]
                })
        
        # Recomendaciones generales si el rendimiento es bueno
        if not recommendations:
            recommendations.append({
                'priority': 'low',
                'category': 'maintenance',
                'title': 'Rendimiento Satisfactorio',
                'description': 'El modelo está funcionando dentro de parámetros aceptables',
                'actions': [
                    'Continuar monitoreo regular',
                    'Recopilar más feedback de expertos',
                    'Considerar optimizaciones menores'
                ]
            })
        
        return recommendations
    
    def generate_evaluation_report(self, model_id: str, output_path: str = None) -> str:
        """Generar reporte completo de evaluación"""
        
        evaluation = self.evaluate_model_performance(model_id)
        
        # Crear reporte en formato JSON
        report = {
            'report_metadata': {
                'generated_at': datetime.now().isoformat(),
                'model_id': model_id,
                'report_version': '1.0'
            },
            'executive_summary': self._create_executive_summary(evaluation),
            'detailed_analysis': evaluation,
            'action_plan': self._create_action_plan(evaluation['recommendations'])
        }
        
        # Guardar reporte
        if output_path is None:
            output_path = f"model_evaluation_report_{model_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False, default=str)
        
        logger.info(f"Evaluation report saved to {output_path}")
        return output_path
    
    def _create_executive_summary(self, evaluation: Dict) -> Dict[str, Any]:
        """Crear resumen ejecutivo"""
        
        metrics = evaluation.get('performance_metrics', {})
        recommendations = evaluation.get('recommendations', [])
        
        # Clasificar estado general
        accuracy = metrics.get('accuracy', 0)
        if accuracy >= 0.9:
            status = 'excellent'
        elif accuracy >= 0.8:
            status = 'good'
        elif accuracy >= 0.7:
            status = 'needs_improvement'
        else:
            status = 'critical'
        
        # Contar recomendaciones por prioridad
        priority_counts = {}
        for rec in recommendations:
            priority = rec.get('priority', 'low')
            priority_counts[priority] = priority_counts.get(priority, 0) + 1
        
        return {
            'overall_status': status,
            'key_metrics': {
                'accuracy': metrics.get('accuracy', 0),
                'confidence': metrics.get('average_confidence', 0),
                'sample_size': metrics.get('sample_size', 0)
            },
            'drift_detected': evaluation.get('drift_analysis', {}).get('drift_detected', False),
            'recommendations_summary': priority_counts,
            'next_review_date': (datetime.now() + timedelta(days=30)).isoformat()
        }
    
    def _create_action_plan(self, recommendations: List[Dict]) -> Dict[str, Any]:
        """Crear plan de acción basado en recomendaciones"""
        
        # Ordenar por prioridad
        priority_order = {'high': 1, 'medium': 2, 'low': 3}
        sorted_recommendations = sorted(
            recommendations, 
            key=lambda x: priority_order.get(x.get('priority', 'low'), 3)
        )
        
        # Crear timeline
        timeline = []
        current_date = datetime.now()
        
        for i, rec in enumerate(sorted_recommendations):
            if rec.get('priority') == 'high':
                due_date = current_date + timedelta(days=7)
            elif rec.get('priority') == 'medium':
                due_date = current_date + timedelta(days=30)
            else:
                due_date = current_date + timedelta(days=90)
            
            timeline.append({
                'task': rec.get('title', ''),
                'priority': rec.get('priority', 'low'),
                'due_date': due_date.isoformat(),
                'actions': rec.get('actions', []),
                'estimated_effort': self._estimate_effort(rec)
            })
        
        return {
            'immediate_actions': [t for t in timeline if t['priority'] == 'high'],
            'short_term_actions': [t for t in timeline if t['priority'] == 'medium'],
            'long_term_actions': [t for t in timeline if t['priority'] == 'low'],
            'total_estimated_hours': sum(t['estimated_effort'] for t in timeline)
        }
    
    def _estimate_effort(self, recommendation: Dict) -> int:
        """Estimar esfuerzo en horas para una recomendación"""
        
        category = recommendation.get('category', '')
        priority = recommendation.get('priority', 'low')
        
        base_hours = {
            'performance': 40,
            'drift': 24,
            'calibration': 16,
            'error_reduction': 32,
            'confidence_calibration': 20,
            'maintenance': 8
        }
        
        multiplier = {
            'high': 1.5,
            'medium': 1.0,
            'low': 0.5
        }
        
        base = base_hours.get(category, 16)
        return int(base * multiplier.get(priority, 1.0))

def main():
    """Función principal para evaluación de modelos"""
    
    import argparse
    
    parser = argparse.ArgumentParser(description='Evaluar modelos especializados')
    parser.add_argument('--model-id', required=True, help='ID del modelo a evaluar')
    parser.add_argument('--days-back', type=int, default=30, help='Días hacia atrás para análisis')
    parser.add_argument('--output-report', help='Ruta para guardar reporte')
    parser.add_argument('--format', choices=['json', 'html'], default='json', help='Formato del reporte')
    
    args = parser.parse_args()
    
    evaluator = ModelEvaluator()
    
    try:
        # Evaluar modelo
        logger.info(f"Evaluando modelo {args.model_id}...")
        evaluation = evaluator.evaluate_model_performance(args.model_id, args.days_back)
        
        # Generar reporte
        report_path = evaluator.generate_evaluation_report(args.model_id, args.output_report)
        
        # Mostrar resumen
        metrics = evaluation.get('performance_metrics', {})
        print(f"\n=== RESUMEN DE EVALUACIÓN ===")
        print(f"Modelo: {args.model_id}")
        print(f"Período: {args.days_back} días")
        print(f"Predicciones analizadas: {metrics.get('sample_size', 0)}")
        print(f"Precisión: {metrics.get('accuracy', 0):.2%}")
        print(f"Confianza promedio: {metrics.get('average_confidence', 0):.3f}")
        print(f"Correlación con expertos: {metrics.get('score_correlation', 0):.3f}")
        
        drift = evaluation.get('drift_analysis', {})
        if drift.get('drift_detected'):
            print(f"⚠️  DRIFT DETECTADO - Magnitud: {drift.get('drift_magnitude', 0):.3f}")
        
        recommendations = evaluation.get('recommendations', [])
        high_priority = [r for r in recommendations if r.get('priority') == 'high']
        if high_priority:
            print(f"🚨 {len(high_priority)} recomendaciones de alta prioridad")
        
        print(f"\nReporte completo guardado en: {report_path}")
        
    except Exception as e:
        logger.error(f"Error durante la evaluación: {str(e)}")
        raise

if __name__ == "__main__":
    main()
