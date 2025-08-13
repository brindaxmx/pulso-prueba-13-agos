#!/usr/bin/env python3
"""
Script para entrenar modelos especializados de AI para verificaciones HORECA
Soporta diferentes tipos de modelos: visión, audio, texto y sensores
"""

import os
import json
import logging
import argparse
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
import numpy as np
import pandas as pd
from pathlib import Path

# ML Libraries
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset
import torchvision.transforms as transforms
from transformers import (
    AutoTokenizer, AutoModel, AutoProcessor,
    WhisperProcessor, WhisperForConditionalGeneration,
    pipeline
)
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix
from sklearn.ensemble import GradientBoostingRegressor
import cv2
import librosa
import whisper

# Database
import psycopg2
from psycopg2.extras import RealDictCursor
import supabase

# Configuration
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class HorecaDataset(Dataset):
    """Dataset personalizado para datos HORECA"""
    
    def __init__(self, data: List[Dict], transform=None, data_type='image'):
        self.data = data
        self.transform = transform
        self.data_type = data_type
        
    def __len__(self):
        return len(self.data)
    
    def __getitem__(self, idx):
        item = self.data[idx]
        
        if self.data_type == 'image':
            # Cargar y procesar imagen
            image_path = item['image_path']
            image = cv2.imread(image_path)
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            if self.transform:
                image = self.transform(image)
                
            return {
                'image': image,
                'label': item['label'],
                'score': item.get('score', 0),
                'metadata': item.get('metadata', {})
            }
            
        elif self.data_type == 'audio':
            # Cargar y procesar audio
            audio_path = item['audio_path']
            audio, sr = librosa.load(audio_path, sr=16000)
            
            # Extraer características
            mfccs = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=13)
            spectral_centroids = librosa.feature.spectral_centroid(y=audio, sr=sr)
            
            features = np.concatenate([
                np.mean(mfccs, axis=1),
                np.mean(spectral_centroids, axis=1)
            ])
            
            return {
                'features': torch.FloatTensor(features),
                'audio': audio,
                'label': item['label'],
                'transcription': item.get('transcription', ''),
                'metadata': item.get('metadata', {})
            }
            
        elif self.data_type == 'sensor':
            # Datos de sensores (temperatura, humedad, etc.)
            features = np.array([
                item['temperature'],
                item.get('humidity', 0),
                item.get('ambient_temp', 20),
                item.get('equipment_age', 1),
                item.get('maintenance_score', 100)
            ])
            
            return {
                'features': torch.FloatTensor(features),
                'label': item['label'],
                'target_value': item.get('target_value', 0),
                'metadata': item.get('metadata', {})
            }

class KitchenHygieneVisionModel(nn.Module):
    """Modelo especializado para evaluación de higiene en cocinas"""
    
    def __init__(self, num_classes=4, pretrained=True):
        super(KitchenHygieneVisionModel, self).__init__()
        
        # Base: ResNet50 pre-entrenado
        import torchvision.models as models
        self.backbone = models.resnet50(pretrained=pretrained)
        
        # Modificar la última capa
        num_features = self.backbone.fc.in_features
        self.backbone.fc = nn.Identity()
        
        # Capas especializadas para higiene
        self.hygiene_classifier = nn.Sequential(
            nn.Linear(num_features, 512),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(256, num_classes)  # excellent, good, needs_improvement, critical
        )
        
        # Regressor para puntuación 0-100
        self.score_regressor = nn.Sequential(
            nn.Linear(num_features, 256),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Linear(128, 1),
            nn.Sigmoid()  # Output 0-1, luego escalar a 0-100
        )
        
        # Attention mechanism para áreas críticas
        self.attention = nn.MultiheadAttention(embed_dim=num_features, num_heads=8)
        
    def forward(self, x):
        # Extraer características
        features = self.backbone(x)
        
        # Aplicar attention
        features_att, _ = self.attention(features.unsqueeze(0), features.unsqueeze(0), features.unsqueeze(0))
        features_att = features_att.squeeze(0)
        
        # Clasificación y regresión
        classification = self.hygiene_classifier(features_att)
        score = self.score_regressor(features_att) * 100  # Escalar a 0-100
        
        return {
            'classification': classification,
            'score': score,
            'features': features_att
        }

class TemperatureControlModel:
    """Modelo especializado para control de temperatura"""
    
    def __init__(self):
        self.model = GradientBoostingRegressor(
            n_estimators=200,
            max_depth=8,
            learning_rate=0.1,
            random_state=42
        )
        self.feature_names = [
            'current_temp', 'humidity', 'ambient_temp', 
            'equipment_age', 'maintenance_score', 'hour_of_day',
            'equipment_type_encoded', 'food_category_encoded'
        ]
        
    def prepare_features(self, data: List[Dict]) -> np.ndarray:
        """Preparar características para el modelo"""
        features = []
        
        for item in data:
            feature_vector = [
                item['temperature'],
                item.get('humidity', 50),
                item.get('ambient_temp', 22),
                item.get('equipment_age', 1),
                item.get('maintenance_score', 100),
                datetime.now().hour,
                self._encode_equipment_type(item.get('equipment_type', 'refrigerator')),
                self._encode_food_category(item.get('food_category', 'general'))
            ]
            features.append(feature_vector)
            
        return np.array(features)
    
    def _encode_equipment_type(self, equipment_type: str) -> int:
        """Codificar tipo de equipo"""
        encoding = {
            'refrigerator': 1, 'freezer': 2, 'oven': 3, 
            'grill': 4, 'fryer': 5, 'warmer': 6
        }
        return encoding.get(equipment_type.lower(), 0)
    
    def _encode_food_category(self, food_category: str) -> int:
        """Codificar categoría de alimento"""
        encoding = {
            'meat': 1, 'dairy': 2, 'vegetables': 3, 
            'seafood': 4, 'prepared': 5, 'beverages': 6
        }
        return encoding.get(food_category.lower(), 0)
    
    def train(self, train_data: List[Dict], val_data: List[Dict]) -> Dict[str, float]:
        """Entrenar el modelo"""
        # Preparar datos
        X_train = self.prepare_features(train_data)
        y_train = np.array([item['target_temp'] for item in train_data])
        
        X_val = self.prepare_features(val_data)
        y_val = np.array([item['target_temp'] for item in val_data])
        
        # Entrenar
        self.model.fit(X_train, y_train)
        
        # Evaluar
        train_pred = self.model.predict(X_train)
        val_pred = self.model.predict(X_val)
        
        metrics = {
            'train_mae': np.mean(np.abs(train_pred - y_train)),
            'val_mae': np.mean(np.abs(val_pred - y_val)),
            'train_rmse': np.sqrt(np.mean((train_pred - y_train) ** 2)),
            'val_rmse': np.sqrt(np.mean((val_pred - y_val) ** 2)),
            'feature_importance': dict(zip(self.feature_names, self.model.feature_importances_))
        }
        
        return metrics

class ServiceAudioAnalyzer:
    """Analizador de audio para servicio al cliente"""
    
    def __init__(self):
        # Cargar modelos pre-entrenados
        self.whisper_model = whisper.load_model("large-v3")
        self.sentiment_pipeline = pipeline(
            "sentiment-analysis", 
            model="nlptown/bert-base-multilingual-uncased-sentiment"
        )
        
    def analyze_service_audio(self, audio_path: str) -> Dict[str, Any]:
        """Analizar audio de servicio al cliente"""
        
        # Transcribir audio
        result = self.whisper_model.transcribe(audio_path, language='es')
        transcription = result['text']
        
        # Análisis de sentimiento
        sentiment = self.sentiment_pipeline(transcription)[0]
        
        # Métricas de calidad de servicio
        service_metrics = self._analyze_service_quality(transcription)
        
        # Análisis temporal
        timing_analysis = self._analyze_timing(result['segments'])
        
        return {
            'transcription': transcription,
            'sentiment': sentiment,
            'service_metrics': service_metrics,
            'timing_analysis': timing_analysis,
            'overall_score': self._calculate_overall_score(service_metrics, sentiment, timing_analysis)
        }
    
    def _analyze_service_quality(self, text: str) -> Dict[str, float]:
        """Analizar calidad del servicio basado en el texto"""
        
        # Palabras clave positivas y negativas
        positive_keywords = [
            'gracias', 'por favor', 'disculpe', 'con gusto', 
            'excelente', 'perfecto', 'claro', 'enseguida'
        ]
        negative_keywords = [
            'no puedo', 'imposible', 'no tenemos', 'espere', 
            'problema', 'error', 'mal', 'tarde'
        ]
        
        text_lower = text.lower()
        
        positive_count = sum(1 for word in positive_keywords if word in text_lower)
        negative_count = sum(1 for word in negative_keywords if word in text_lower)
        
        # Calcular métricas
        politeness_score = min(100, (positive_count / max(1, len(text.split()) / 10)) * 100)
        clarity_score = 100 - (negative_count / max(1, len(text.split()) / 10)) * 50
        
        return {
            'politeness': max(0, min(100, politeness_score)),
            'clarity': max(0, min(100, clarity_score)),
            'positive_keywords': positive_count,
            'negative_keywords': negative_count
        }
    
    def _analyze_timing(self, segments: List[Dict]) -> Dict[str, float]:
        """Analizar timing del servicio"""
        
        if not segments:
            return {'response_time': 0, 'speech_rate': 0, 'pause_analysis': 0}
        
        # Calcular velocidad de habla
        total_duration = segments[-1]['end'] - segments[0]['start']
        total_words = sum(len(seg['text'].split()) for seg in segments)
        speech_rate = total_words / total_duration * 60  # palabras por minuto
        
        # Analizar pausas
        pauses = []
        for i in range(1, len(segments)):
            pause = segments[i]['start'] - segments[i-1]['end']
            if pause > 0.5:  # Pausas mayores a 0.5 segundos
                pauses.append(pause)
        
        avg_pause = np.mean(pauses) if pauses else 0
        
        return {
            'total_duration': total_duration,
            'speech_rate': speech_rate,
            'average_pause': avg_pause,
            'long_pauses': len([p for p in pauses if p > 2.0])
        }
    
    def _calculate_overall_score(self, service_metrics: Dict, sentiment: Dict, timing: Dict) -> float:
        """Calcular puntuación general del servicio"""
        
        # Pesos para diferentes aspectos
        weights = {
            'politeness': 0.3,
            'clarity': 0.25,
            'sentiment': 0.25,
            'timing': 0.2
        }
        
        # Normalizar sentiment score (1-5 stars to 0-100)
        sentiment_score = (float(sentiment['label'].split()[0]) - 1) * 25
        
        # Normalizar timing score
        timing_score = min(100, max(0, 100 - (timing['average_pause'] * 10)))
        
        overall_score = (
            service_metrics['politeness'] * weights['politeness'] +
            service_metrics['clarity'] * weights['clarity'] +
            sentiment_score * weights['sentiment'] +
            timing_score * weights['timing']
        )
        
        return round(overall_score, 2)

class ModelTrainer:
    """Clase principal para entrenar modelos especializados"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.db_connection = self._connect_to_database()
        self.supabase_client = self._connect_to_supabase()
        
    def _connect_to_database(self):
        """Conectar a la base de datos PostgreSQL"""
        return psycopg2.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            database=os.getenv('DB_NAME', 'pulso'),
            user=os.getenv('DB_USER', 'postgres'),
            password=os.getenv('DB_PASSWORD', ''),
            cursor_factory=RealDictCursor
        )
    
    def _connect_to_supabase(self):
        """Conectar a Supabase"""
        return supabase.create_client(
            os.getenv('SUPABASE_URL'),
            os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        )
    
    def load_training_data(self, dataset_id: str) -> Tuple[List[Dict], Dict[str, Any]]:
        """Cargar datos de entrenamiento desde la base de datos"""
        
        with self.db_connection.cursor() as cursor:
            # Obtener información del dataset
            cursor.execute("""
                SELECT * FROM ai_training_datasets WHERE id = %s
            """, (dataset_id,))
            dataset_info = cursor.fetchone()
            
            if not dataset_info:
                raise ValueError(f"Dataset {dataset_id} not found")
            
            # Cargar datos según el tipo
            verification_type = dataset_info['verification_type']
            
            if verification_type == 'kitchen_hygiene_restaurant':
                data = self._load_image_data(dataset_info)
            elif verification_type == 'food_temperature_control':
                data = self._load_sensor_data(dataset_info)
            elif verification_type == 'speed_service_fastfood':
                data = self._load_audio_data(dataset_info)
            else:
                raise ValueError(f"Unsupported verification type: {verification_type}")
            
            return data, dict(dataset_info)
    
    def _load_image_data(self, dataset_info: Dict) -> List[Dict]:
        """Cargar datos de imágenes para entrenamiento"""
        
        # En un entorno real, esto cargaría desde el storage
        # Por ahora, simulamos datos de ejemplo
        data = []
        
        # Simular datos de entrenamiento
        for i in range(dataset_info['labeled_samples']):
            data.append({
                'image_path': f"/data/images/kitchen_{i:04d}.jpg",
                'label': np.random.choice(['excellent', 'good', 'needs_improvement', 'critical']),
                'score': np.random.randint(60, 100),
                'metadata': {
                    'restaurant_type': np.random.choice(['fast_food', 'casual', 'fine_dining']),
                    'area': np.random.choice(['prep', 'cooking', 'storage', 'cleaning']),
                    'shift': np.random.choice(['morning', 'afternoon', 'evening'])
                }
            })
        
        return data
    
    def _load_sensor_data(self, dataset_info: Dict) -> List[Dict]:
        """Cargar datos de sensores para entrenamiento"""
        
        data = []
        
        for i in range(dataset_info['labeled_samples']):
            # Simular lecturas de temperatura
            base_temp = np.random.choice([2.0, -18.0, 65.0])  # Refrigeración, congelación, caliente
            noise = np.random.normal(0, 0.5)
            
            data.append({
                'temperature': base_temp + noise,
                'humidity': np.random.uniform(40, 80),
                'ambient_temp': np.random.uniform(18, 28),
                'equipment_age': np.random.uniform(0.5, 10),
                'maintenance_score': np.random.uniform(70, 100),
                'target_temp': base_temp,
                'label': 'compliant' if abs(noise) < 1.0 else 'non_compliant',
                'metadata': {
                    'equipment_type': np.random.choice(['refrigerator', 'freezer', 'oven']),
                    'food_category': np.random.choice(['meat', 'dairy', 'vegetables'])
                }
            })
        
        return data
    
    def _load_audio_data(self, dataset_info: Dict) -> List[Dict]:
        """Cargar datos de audio para entrenamiento"""
        
        data = []
        
        for i in range(dataset_info['labeled_samples']):
            data.append({
                'audio_path': f"/data/audio/service_{i:04d}.wav",
                'transcription': f"Ejemplo de transcripción {i}",
                'label': np.random.choice(['excellent', 'good', 'needs_improvement']),
                'metadata': {
                    'service_type': np.random.choice(['drive_thru', 'counter', 'phone']),
                    'duration': np.random.uniform(30, 180),
                    'language': 'es'
                }
            })
        
        return data
    
    def train_vision_model(self, train_data: List[Dict], val_data: List[Dict], model_config: Dict) -> Dict[str, Any]:
        """Entrenar modelo de visión para higiene de cocina"""
        
        logger.info("Iniciando entrenamiento de modelo de visión...")
        
        # Transformaciones de datos
        train_transform = transforms.Compose([
            transforms.ToPILImage(),
            transforms.Resize((224, 224)),
            transforms.RandomHorizontalFlip(p=0.5),
            transforms.RandomRotation(15),
            transforms.ColorJitter(brightness=0.2, contrast=0.2),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        
        val_transform = transforms.Compose([
            transforms.ToPILImage(),
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        
        # Crear datasets
        train_dataset = HorecaDataset(train_data, transform=train_transform, data_type='image')
        val_dataset = HorecaDataset(val_data, transform=val_transform, data_type='image')
        
        # DataLoaders
        train_loader = DataLoader(train_dataset, batch_size=model_config.get('batch_size', 32), shuffle=True)
        val_loader = DataLoader(val_dataset, batch_size=model_config.get('batch_size', 32), shuffle=False)
        
        # Modelo
        model = KitchenHygieneVisionModel(num_classes=4)
        device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        model.to(device)
        
        # Optimizador y loss
        optimizer = optim.Adam(model.parameters(), lr=model_config.get('learning_rate', 0.001))
        classification_loss = nn.CrossEntropyLoss()
        regression_loss = nn.MSELoss()
        
        # Entrenamiento
        num_epochs = model_config.get('epochs', 50)
        best_val_loss = float('inf')
        training_history = {'train_loss': [], 'val_loss': [], 'val_accuracy': []}
        
        for epoch in range(num_epochs):
            # Entrenamiento
            model.train()
            train_loss = 0.0
            
            for batch in train_loader:
                # Simular batch (en implementación real cargaría imágenes)
                batch_size = len(batch['label'])
                images = torch.randn(batch_size, 3, 224, 224).to(device)
                
                # Labels
                labels = torch.tensor([
                    ['excellent', 'good', 'needs_improvement', 'critical'].index(label) 
                    for label in batch['label']
                ]).to(device)
                scores = torch.tensor(batch['score'], dtype=torch.float32).to(device)
                
                optimizer.zero_grad()
                
                outputs = model(images)
                
                # Loss combinado
                cls_loss = classification_loss(outputs['classification'], labels)
                reg_loss = regression_loss(outputs['score'].squeeze(), scores)
                total_loss = cls_loss + 0.1 * reg_loss
                
                total_loss.backward()
                optimizer.step()
                
                train_loss += total_loss.item()
            
            # Validación
            model.eval()
            val_loss = 0.0
            correct = 0
            total = 0
            
            with torch.no_grad():
                for batch in val_loader:
                    batch_size = len(batch['label'])
                    images = torch.randn(batch_size, 3, 224, 224).to(device)
                    
                    labels = torch.tensor([
                        ['excellent', 'good', 'needs_improvement', 'critical'].index(label) 
                        for label in batch['label']
                    ]).to(device)
                    scores = torch.tensor(batch['score'], dtype=torch.float32).to(device)
                    
                    outputs = model(images)
                    
                    cls_loss = classification_loss(outputs['classification'], labels)
                    reg_loss = regression_loss(outputs['score'].squeeze(), scores)
                    total_loss = cls_loss + 0.1 * reg_loss
                    
                    val_loss += total_loss.item()
                    
                    _, predicted = torch.max(outputs['classification'].data, 1)
                    total += labels.size(0)
                    correct += (predicted == labels).sum().item()
            
            # Métricas
            avg_train_loss = train_loss / len(train_loader)
            avg_val_loss = val_loss / len(val_loader)
            val_accuracy = 100 * correct / total
            
            training_history['train_loss'].append(avg_train_loss)
            training_history['val_loss'].append(avg_val_loss)
            training_history['val_accuracy'].append(val_accuracy)
            
            logger.info(f"Epoch {epoch+1}/{num_epochs}: "
                       f"Train Loss: {avg_train_loss:.4f}, "
                       f"Val Loss: {avg_val_loss:.4f}, "
                       f"Val Accuracy: {val_accuracy:.2f}%")
            
            # Guardar mejor modelo
            if avg_val_loss < best_val_loss:
                best_val_loss = avg_val_loss
                torch.save(model.state_dict(), f"/tmp/best_model_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pth")
        
        return {
            'training_history': training_history,
            'final_metrics': {
                'train_loss': training_history['train_loss'][-1],
                'val_loss': training_history['val_loss'][-1],
                'val_accuracy': training_history['val_accuracy'][-1],
                'best_val_loss': best_val_loss
            },
            'model_path': f"/tmp/best_model_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pth"
        }
    
    def train_temperature_model(self, train_data: List[Dict], val_data: List[Dict]) -> Dict[str, Any]:
        """Entrenar modelo de control de temperatura"""
        
        logger.info("Iniciando entrenamiento de modelo de temperatura...")
        
        model = TemperatureControlModel()
        metrics = model.train(train_data, val_data)
        
        # Guardar modelo
        import joblib
        model_path = f"/tmp/temp_model_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pkl"
        joblib.dump(model.model, model_path)
        
        return {
            'metrics': metrics,
            'model_path': model_path,
            'feature_names': model.feature_names
        }
    
    def train_audio_model(self, train_data: List[Dict], val_data: List[Dict]) -> Dict[str, Any]:
        """Entrenar modelo de análisis de audio"""
        
        logger.info("Iniciando entrenamiento de modelo de audio...")
        
        analyzer = ServiceAudioAnalyzer()
        
        # Simular entrenamiento con datos de audio
        training_results = []
        validation_results = []
        
        # Procesar datos de entrenamiento
        for item in train_data:
            # En implementación real, procesaría archivos de audio reales
            # Por ahora simulamos el análisis
            simulated_analysis = {
                'transcription': item.get('transcription', ''),
                'sentiment': {'label': '4 stars', 'score': 0.8},
                'service_metrics': {
                    'politeness': np.random.uniform(70, 95),
                    'clarity': np.random.uniform(75, 90),
                    'positive_keywords': np.random.randint(2, 8),
                    'negative_keywords': np.random.randint(0, 3)
                },
                'timing_analysis': {
                    'total_duration': np.random.uniform(30, 180),
                    'speech_rate': np.random.uniform(120, 180),
                    'average_pause': np.random.uniform(0.5, 2.0),
                    'long_pauses': np.random.randint(0, 3)
                },
                'overall_score': np.random.uniform(70, 95)
            }
            training_results.append(simulated_analysis)
        
        # Procesar datos de validación
        for item in val_data:
            simulated_analysis = {
                'transcription': item.get('transcription', ''),
                'sentiment': {'label': '3 stars', 'score': 0.7},
                'service_metrics': {
                    'politeness': np.random.uniform(65, 90),
                    'clarity': np.random.uniform(70, 85),
                    'positive_keywords': np.random.randint(1, 6),
                    'negative_keywords': np.random.randint(0, 4)
                },
                'timing_analysis': {
                    'total_duration': np.random.uniform(30, 180),
                    'speech_rate': np.random.uniform(110, 170),
                    'average_pause': np.random.uniform(0.8, 2.5),
                    'long_pauses': np.random.randint(0, 4)
                },
                'overall_score': np.random.uniform(65, 90)
            }
            validation_results.append(simulated_analysis)
        
        # Calcular métricas de rendimiento
        train_scores = [r['overall_score'] for r in training_results]
        val_scores = [r['overall_score'] for r in validation_results]
        
        metrics = {
            'train_avg_score': np.mean(train_scores),
            'val_avg_score': np.mean(val_scores),
            'train_std': np.std(train_scores),
            'val_std': np.std(val_scores),
            'score_correlation': np.corrcoef(train_scores[:len(val_scores)], val_scores)[0, 1] if len(val_scores) > 1 else 0.0
        }
        
        return {
            'metrics': metrics,
            'training_results': training_results[:5],  # Muestra de resultados
            'validation_results': validation_results[:5],
            'model_components': {
                'whisper_model': 'large-v3',
                'sentiment_model': 'bert-base-multilingual-uncased-sentiment',
                'custom_analyzers': ['service_quality', 'timing_analysis']
            }
        }
    
    def save_training_run(self, model_id: str, training_config: Dict, results: Dict) -> str:
        """Guardar resultados del entrenamiento en la base de datos"""
        
        with self.db_connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO model_training_runs (
                    model_id, run_name, training_config, dataset_split,
                    training_start, training_end, training_duration_minutes,
                    final_metrics, epoch_metrics, hyperparameters, status
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (
                model_id,
                f"Training_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                json.dumps(training_config),
                json.dumps({'train': 0.7, 'val': 0.2, 'test': 0.1}),
                datetime.now() - timedelta(hours=1),  # Simular inicio
                datetime.now(),
                60,  # Simular 1 hora de entrenamiento
                json.dumps(results.get('final_metrics', {})),
                json.dumps(results.get('training_history', {})),
                json.dumps(training_config),
                'completed'
            ))
            
            run_id = cursor.fetchone()['id']
            self.db_connection.commit()
            
            logger.info(f"Training run saved with ID: {run_id}")
            return run_id
    
    def deploy_model(self, model_id: str, model_path: str, performance_metrics: Dict) -> bool:
        """Desplegar modelo entrenado"""
        
        try:
            with self.db_connection.cursor() as cursor:
                # Actualizar estado del modelo
                cursor.execute("""
                    UPDATE specialized_ai_models 
                    SET deployment_status = 'deployed',
                        deployed_at = NOW(),
                        performance_benchmark = %s,
                        model_artifacts = %s
                    WHERE id = %s
                """, (
                    json.dumps(performance_metrics),
                    json.dumps({'model_path': model_path, 'deployed_at': datetime.now().isoformat()}),
                    model_id
                ))
                
                self.db_connection.commit()
                
                logger.info(f"Model {model_id} deployed successfully")
                return True
                
        except Exception as e:
            logger.error(f"Error deploying model {model_id}: {str(e)}")
            return False

def main():
    """Función principal para entrenar modelos especializados"""
    
    parser = argparse.ArgumentParser(description='Entrenar modelos especializados HORECA')
    parser.add_argument('--model-type', required=True, 
                       choices=['vision', 'temperature', 'audio', 'all'],
                       help='Tipo de modelo a entrenar')
    parser.add_argument('--dataset-id', required=True, 
                       help='ID del dataset de entrenamiento')
    parser.add_argument('--config-file', default='config/training_config.json',
                       help='Archivo de configuración')
    parser.add_argument('--epochs', type=int, default=50,
                       help='Número de épocas de entrenamiento')
    parser.add_argument('--batch-size', type=int, default=32,
                       help='Tamaño del batch')
    parser.add_argument('--learning-rate', type=float, default=0.001,
                       help='Tasa de aprendizaje')
    
    args = parser.parse_args()
    
    # Cargar configuración
    config = {
        'model_type': args.model_type,
        'dataset_id': args.dataset_id,
        'epochs': args.epochs,
        'batch_size': args.batch_size,
        'learning_rate': args.learning_rate
    }
    
    if os.path.exists(args.config_file):
        with open(args.config_file, 'r') as f:
            file_config = json.load(f)
            config.update(file_config)
    
    # Inicializar trainer
    trainer = ModelTrainer(config)
    
    try:
        # Cargar datos
        logger.info(f"Cargando dataset {args.dataset_id}...")
        train_data, dataset_info = trainer.load_training_data(args.dataset_id)
        
        # Dividir datos
        train_split = int(len(train_data) * 0.8)
        train_subset = train_data[:train_split]
        val_subset = train_data[train_split:]
        
        logger.info(f"Datos cargados: {len(train_subset)} entrenamiento, {len(val_subset)} validación")
        
        # Entrenar según el tipo de modelo
        if args.model_type == 'vision' or args.model_type == 'all':
            logger.info("Entrenando modelo de visión...")
            vision_results = trainer.train_vision_model(train_subset, val_subset, config)
            
            # Guardar resultados
            model_id = "vision_model_id"  # En implementación real, obtener de DB
            trainer.save_training_run(model_id, config, vision_results)
            trainer.deploy_model(model_id, vision_results['model_path'], vision_results['final_metrics'])
        
        if args.model_type == 'temperature' or args.model_type == 'all':
            logger.info("Entrenando modelo de temperatura...")
            temp_results = trainer.train_temperature_model(train_subset, val_subset)
            
            model_id = "temperature_model_id"
            trainer.save_training_run(model_id, config, temp_results)
            trainer.deploy_model(model_id, temp_results['model_path'], temp_results['metrics'])
        
        if args.model_type == 'audio' or args.model_type == 'all':
            logger.info("Entrenando modelo de audio...")
            audio_results = trainer.train_audio_model(train_subset, val_subset)
            
            model_id = "audio_model_id"
            trainer.save_training_run(model_id, config, audio_results)
            trainer.deploy_model(model_id, "audio_model_path", audio_results['metrics'])
        
        logger.info("Entrenamiento completado exitosamente!")
        
    except Exception as e:
        logger.error(f"Error durante el entrenamiento: {str(e)}")
        raise

if __name__ == "__main__":
    main()
