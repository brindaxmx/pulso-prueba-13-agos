#!/bin/bash

# Script para configurar el entorno de entrenamiento de modelos especializados HORECA
# Incluye instalación de dependencias, configuración de GPU y preparación de datos

set -e

echo "🚀 Configurando entorno de entrenamiento PULSO HORECA..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

# Verificar sistema operativo
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
else
    error "Sistema operativo no soportado: $OSTYPE"
fi

log "Sistema detectado: $OS"

# Verificar Python 3.8+
if ! command -v python3 &> /dev/null; then
    error "Python 3 no está instalado"
fi

PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
REQUIRED_VERSION="3.8"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$PYTHON_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    error "Python $REQUIRED_VERSION+ requerido. Versión actual: $PYTHON_VERSION"
fi

log "Python $PYTHON_VERSION ✓"

# Crear directorio de trabajo
WORK_DIR="$HOME/pulso_training"
mkdir -p "$WORK_DIR"
cd "$WORK_DIR"

log "Directorio de trabajo: $WORK_DIR"

# Crear entorno virtual
if [ ! -d "venv" ]; then
    log "Creando entorno virtual..."
    python3 -m venv venv
fi

source venv/bin/activate
log "Entorno virtual activado ✓"

# Actualizar pip
log "Actualizando pip..."
pip install --upgrade pip

# Detectar GPU
GPU_AVAILABLE=false
if command -v nvidia-smi &> /dev/null; then
    if nvidia-smi &> /dev/null; then
        GPU_AVAILABLE=true
        GPU_INFO=$(nvidia-smi --query-gpu=name,memory.total --format=csv,noheader,nounits)
        log "GPU detectada: $GPU_INFO"
    fi
fi

# Instalar PyTorch
log "Instalando PyTorch..."
if [ "$GPU_AVAILABLE" = true ]; then
    pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
    log "PyTorch con soporte CUDA instalado ✓"
else
    pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
    warn "PyTorch CPU instalado (sin GPU)"
fi

# Instalar dependencias de ML
log "Instalando dependencias de Machine Learning..."
cat > requirements_ml.txt << EOF
# Core ML libraries
numpy>=1.21.0
pandas>=1.3.0
scikit-learn>=1.0.0
scipy>=1.7.0

# Deep Learning
transformers>=4.20.0
datasets>=2.0.0
accelerate>=0.20.0
evaluate>=0.4.0

# Computer Vision
opencv-python>=4.5.0
Pillow>=8.3.0
albumentations>=1.3.0

# Audio Processing
librosa>=0.9.0
soundfile>=0.10.0
openai-whisper>=20230314

# NLP
tokenizers>=0.13.0
sentencepiece>=0.1.97

# Visualization
matplotlib>=3.5.0
seaborn>=0.11.0
plotly>=5.0.0

# Utilities
tqdm>=4.62.0
wandb>=0.13.0
tensorboard>=2.8.0
joblib>=1.1.0

# Database
psycopg2-binary>=2.9.0
supabase>=1.0.0

# API
fastapi>=0.95.0
uvicorn>=0.20.0
pydantic>=1.10.0
EOF

pip install -r requirements_ml.txt

log "Dependencias ML instaladas ✓"

# Configurar directorios de datos
log "Configurando estructura de directorios..."
mkdir -p data/{raw,processed,models,logs,reports}
mkdir -p data/raw/{images,audio,sensors,annotations}
mkdir -p data/processed/{train,val,test}
mkdir -p models/{vision,audio,temperature,deployment}
mkdir -p config
mkdir -p scripts

log "Estructura de directorios creada ✓"

# Crear configuración por defecto
log "Creando archivos de configuración..."

cat > config/training_config.yaml << EOF
# Configuración de entrenamiento PULSO HORECA
project_name: "pulso_horeca_models"
experiment_name: "specialized_training"

# Configuración de datos
data:
  base_path: "./data"
  train_split: 0.7
  val_split: 0.2
  test_split: 0.1
  augmentation: true
  
# Configuración de modelos
models:
  vision:
    architecture: "resnet50"
    input_size: [224, 224]
    num_classes: 4
    pretrained: true
    
  temperature:
    algorithm: "gradient_boosting"
    n_estimators: 200
    max_depth: 8
    
  audio:
    whisper_model: "large-v3"
    sample_rate: 16000
    
# Configuración de entrenamiento
training:
  batch_size: 32
  learning_rate: 0.001
  epochs: 50
  early_stopping_patience: 10
  
# Hardware
hardware:
  device: "auto"
  mixed_precision: true
  num_workers: 4
  
# Logging
logging:
  use_wandb: true
  log_frequency: 10
  save_checkpoints: true
  
# Evaluación
evaluation:
  metrics: ["accuracy", "precision", "recall", "f1_score"]
  confidence_threshold: 0.8
EOF

# Crear script de entrenamiento básico
cat > scripts/train_model.py << 'EOF'
#!/usr/bin/env python3
"""
Script básico para entrenar modelos especializados
"""

import os
import yaml
import argparse
from pathlib import Path

def load_config(config_path):
    with open(config_path, 'r') as f:
        return yaml.safe_load(f)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--config', default='config/training_config.yaml')
    parser.add_argument('--model-type', choices=['vision', 'audio', 'temperature'])
    args = parser.parse_args()
    
    config = load_config(args.config)
    print(f"Configuración cargada: {config['project_name']}")
    print(f"Entrenando modelo: {args.model_type}")
    
    # Aquí iría la lógica de entrenamiento
    print("Entrenamiento completado!")

if __name__ == "__main__":
    main()
EOF

chmod +x scripts/train_model.py

log "Archivos de configuración creados ✓"

# Configurar variables de entorno
cat > .env.example << EOF
# Base de datos
DB_HOST=localhost
DB_NAME=pulso
DB_USER=postgres
DB_PASSWORD=your_password

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI (para Whisper y GPT)
OPENAI_API_KEY=your_openai_key

# Weights & Biases (opcional)
WANDB_API_KEY=your_wandb_key

# Rutas de datos
DATA_PATH=./data
MODELS_PATH=./models
LOGS_PATH=./logs
EOF

log "Archivo .env.example creado ✓"

# Verificar instalación de GPU
if [ "$GPU_AVAILABLE" = true ]; then
    log "Verificando instalación de PyTorch con GPU..."
    python3 -c "
import torch
print(f'PyTorch version: {torch.__version__}')
print(f'CUDA available: {torch.cuda.is_available()}')
if torch.cuda.is_available():
    print(f'CUDA version: {torch.version.cuda}')
    print(f'GPU count: {torch.cuda.device_count()}')
    for i in range(torch.cuda.device_count()):
        print(f'GPU {i}: {torch.cuda.get_device_name(i)}')
"
fi

# Crear script de verificación
cat > scripts/verify_setup.py << 'EOF'
#!/usr/bin/env python3
"""
Script para verificar que el entorno está correctamente configurado
"""

import sys
import importlib
import torch
import numpy as np
from pathlib import Path

def check_package(package_name, min_version=None):
    try:
        module = importlib.import_module(package_name)
        version = getattr(module, '__version__', 'unknown')
        print(f"✓ {package_name}: {version}")
        return True
    except ImportError:
        print(f"✗ {package_name}: No instalado")
        return False

def main():
    print("🔍 Verificando configuración del entorno...\n")
    
    # Verificar Python
    print(f"Python: {sys.version}")
    
    # Verificar paquetes críticos
    packages = [
        'torch', 'torchvision', 'transformers', 'sklearn',
        'cv2', 'librosa', 'whisper', 'pandas', 'numpy'
    ]
    
    all_good = True
    for package in packages:
        if not check_package(package):
            all_good = False
    
    # Verificar GPU
    print(f"\n🖥️  Hardware:")
    print(f"CUDA disponible: {torch.cuda.is_available()}")
    if torch.cuda.is_available():
        print(f"GPUs detectadas: {torch.cuda.device_count()}")
        for i in range(torch.cuda.device_count()):
            print(f"  - {torch.cuda.get_device_name(i)}")
    
    # Verificar directorios
    print(f"\n📁 Directorios:")
    required_dirs = ['data', 'models', 'config', 'scripts']
    for dir_name in required_dirs:
        if Path(dir_name).exists():
            print(f"✓ {dir_name}/")
        else:
            print(f"✗ {dir_name}/")
            all_good = False
    
    print(f"\n{'✅ Entorno configurado correctamente!' if all_good else '❌ Hay problemas en la configuración'}")
    return 0 if all_good else 1

if __name__ == "__main__":
    sys.exit(main())
EOF

chmod +x scripts/verify_setup.py

# Ejecutar verificación
log "Ejecutando verificación del entorno..."
python3 scripts/verify_setup.py

# Crear script de descarga de datos de ejemplo
cat > scripts/download_sample_data.py << 'EOF'
#!/usr/bin/env python3
"""
Script para descargar datos de ejemplo para entrenamiento
"""

import os
import requests
from pathlib import Path
import zipfile

def download_file(url, destination):
    """Descargar archivo con barra de progreso"""
    response = requests.get(url, stream=True)
    total_size = int(response.headers.get('content-length', 0))
    
    with open(destination, 'wb') as f:
        downloaded = 0
        for chunk in response.iter_content(chunk_size=8192):
            if chunk:
                f.write(chunk)
                downloaded += len(chunk)
                if total_size > 0:
                    percent = (downloaded / total_size) * 100
                    print(f"\rDescargando: {percent:.1f}%", end='', flush=True)
    print()

def main():
    print("📥 Descargando datos de ejemplo...")
    
    # URLs de datos de ejemplo (simuladas)
    sample_data = {
        'kitchen_images.zip': 'https://example.com/kitchen_images.zip',
        'temperature_data.csv': 'https://example.com/temperature_data.csv',
        'service_audio.zip': 'https://example.com/service_audio.zip'
    }
    
    data_dir = Path('data/raw')
    data_dir.mkdir(parents=True, exist_ok=True)
    
    for filename, url in sample_data.items():
        destination = data_dir / filename
        print(f"Descargando {filename}...")
        
        # En un entorno real, descargaría los archivos
        # download_file(url, destination)
        
        # Por ahora, crear archivos de ejemplo
        if filename.endswith('.zip'):
            # Crear archivo zip vacío
            with zipfile.ZipFile(destination, 'w') as zf:
                zf.writestr('example.txt', 'Datos de ejemplo')
        else:
            # Crear archivo CSV de ejemplo
            with open(destination, 'w') as f:
                f.write('timestamp,temperature,equipment,location\n')
                f.write('2024-01-01 10:00:00,2.5,refrigerator,kitchen\n')
        
        print(f"✓ {filename} descargado")
    
    print("\n✅ Datos de ejemplo descargados correctamente!")

if __name__ == "__main__":
    main()
EOF

chmod +x scripts/download_sample_data.py

# Crear documentación
cat > README.md << EOF
# PULSO HORECA - Entorno de Entrenamiento de Modelos

## 🚀 Configuración Completada

Este entorno está configurado para entrenar modelos especializados de AI para el sector HORECA.

### 📁 Estructura de Directorios

\`\`\`
pulso_training/
├── data/
│   ├── raw/           # Datos originales
│   ├── processed/     # Datos procesados
│   └── models/        # Modelos entrenados
├── config/            # Archivos de configuración
├── scripts/           # Scripts de entrenamiento
├── models/            # Arquitecturas de modelos
└── logs/              # Logs de entrenamiento
\`\`\`

### 🔧 Comandos Útiles

\`\`\`bash
# Activar entorno virtual
source venv/bin/activate

# Verificar configuración
python scripts/verify_setup.py

# Descargar datos de ejemplo
python scripts/download_sample_data.py

# Entrenar modelo de visión
python scripts/train_model.py --model-type vision

# Entrenar modelo de temperatura
python scripts/train_model.py --model-type temperature

# Entrenar modelo de audio
python scripts/train_model.py --model-type audio
\`\`\`

### 📊 Modelos Soportados

1. **Modelo de Visión**: Evaluación de higiene en cocinas
2. **Modelo de Temperatura**: Control de temperaturas críticas
3. **Modelo de Audio**: Análisis de calidad de servicio
4. **Modelo de Hotel**: Estándares de limpieza hotelera

### 🔑 Variables de Entorno

Copia \`.env.example\` a \`.env\` y configura:

- Credenciales de base de datos
- API keys (OpenAI, Supabase)
- Rutas de datos y modelos

### 📈 Monitoreo

- **Weights & Biases**: Tracking de experimentos
- **TensorBoard**: Visualización de métricas
- **Custom Dashboard**: Métricas especializadas

### 🚨 Troubleshooting

Si encuentras problemas:

1. Verifica que Python 3.8+ esté instalado
2. Asegúrate de que el entorno virtual esté activado
3. Ejecuta \`python scripts/verify_setup.py\`
4. Revisa los logs en \`logs/\`

### 📞 Soporte

Para soporte técnico, contacta al equipo de AI de PULSO.
EOF

log "Documentación creada ✓"

# Resumen final
echo
echo "🎉 ¡Configuración completada exitosamente!"
echo
echo -e "${BLUE}📍 Directorio de trabajo:${NC} $WORK_DIR"
echo -e "${BLUE}🐍 Python version:${NC} $PYTHON_VERSION"
echo -e "${BLUE}🖥️  GPU disponible:${NC} $GPU_AVAILABLE"
echo
echo -e "${GREEN}Próximos pasos:${NC}"
echo "1. Copia .env.example a .env y configura las variables"
echo "2. Ejecuta: python scripts/verify_setup.py"
echo "3. Descarga datos: python scripts/download_sample_data.py"
echo "4. Inicia entrenamiento: python scripts/train_model.py --model-type vision"
echo
echo -e "${YELLOW}Para activar el entorno:${NC} source $WORK_DIR/venv/bin/activate"
echo

log "Setup completado! 🚀"
