# backend/app.py
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os
import ipaddress

app = Flask(__name__)

# Configuración de la base de datos (usar variables de entorno en producción)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://user:password@localhost/centinela_db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Modelo de la tabla (mapeo objeto-relacional)
class AccessLog(db.Model):
    __tablename__ = 'access_logs'
    id = db.Column(db.Integer, primary_key=True)
    usuario = db.Column(db.String(100), nullable=False)
    ip_address = db.Column(db.String(45), nullable=False) # IPv6 puede ser larga
    access_timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    table_accessed = db.Column(db.String(100), nullable=False)
    operation_type = db.Column(db.String(10), nullable=False)
    was_successful = db.Column(db.Boolean, nullable=False)
    anomaly_score = db.Column(db.Float, default=0.0)

    def to_dict(self):
        return {
            'id': self.id,
            'usuario': self.usuario,
            'ip_address': self.ip_address,
            'access_timestamp': self.access_timestamp.isoformat(),
            'table_accessed': self.table_accessed,
            'operation_type': self.operation_type,
            'was_successful': self.was_successful,
            'anomaly_score': self.anomaly_score
        }

# --- ENDPOINTS DE LA API ---

@app.route('/api/log-access', methods=['POST'])
def log_access():
    """Recibe un nuevo log de acceso y lo guarda en BD."""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'Faltan datos JSON'}), 400

    # Validación básica de campos requeridos
    required_fields = ['usuario', 'ip_address', 'table_accessed', 'operation_type', 'was_successful']
    if not all(field in data for field in required_fields):
        return jsonify({'error': f'Faltan campos requeridos: {required_fields}'}), 400

    try:
        new_log = AccessLog(
            usuario=data['usuario'],
            ip_address=data['ip_address'],
            table_accessed=data['table_accessed'],
            operation_type=data['operation_type'],
            was_successful=data['was_successful']
        )
        db.session.add(new_log)
        db.session.commit()
        return jsonify({'message': 'Log guardado exitosamente', 'id': new_log.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error al guardar en BD: {str(e)}'}), 500


@app.route('/api/recent-anomalies', methods=['GET'])
def get_recent_anomalies():
    """Devuelve los últimos 10 accesos anómalos (fallidos o desde IP externa)."""
    anomalies = []
    try:
        # Obtenemos todos los logs recientes (últimos 100 para ejemplo) y filtramos en Python
        # En un sistema real, esto se haría con una consulta SQL más compleja.
        recent_logs = AccessLog.query.order_by(AccessLog.access_timestamp.desc()).limit(100).all()
        
        for log in recent_logs:
            is_anomaly = False
            ip = log.ip_address
            
            # Regla 1: Acceso fallido
            if not log.was_successful:
                is_anomaly = True
            
            # Regla 2: IP no es de red interna (192.168.x.x, 10.x.x.x)
            try:
                ip_obj = ipaddress.ip_address(ip)
                if not (ip_obj.is_private):
                    is_anomaly = True
            except ValueError:
                # Si la IP no es válida, también la consideramos anomalía
                is_anomaly = True
            
            if is_anomaly:
                anomalies.append(log.to_dict())
                if len(anomalies) >= 10:
                    break
        
        return jsonify(anomalies), 200
    except Exception as e:
        return jsonify({'error': f'Error al consultar BD: {str(e)}'}), 500

if __name__ == '__main__':
    # Crea las tablas si no existen (solo para desarrollo)
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000)