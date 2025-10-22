import json
import base64
import os
from typing import Dict, Any, Optional
from datetime import datetime

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Manages file operations - upload, list, download files by category
    Args: event with httpMethod, body, queryStringParameters
          context with request_id, function_name attributes
    Returns: HTTP response with file data
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'GET':
        params = event.get('queryStringParameters', {}) or {}
        category = params.get('category', 'all')
        year = params.get('year')
        search = params.get('search', '')
        
        mock_files = {
            'photos': [
                {'id': '1', 'name': 'IMG_2024_001.jpg', 'size': '4.2 MB', 'date': '15 окт 2024', 'year': '2024', 'category': 'photos'},
                {'id': '2', 'name': 'IMG_2024_002.jpg', 'size': '3.8 MB', 'date': '14 окт 2024', 'year': '2024', 'category': 'photos'},
                {'id': '3', 'name': 'IMG_2023_156.jpg', 'size': '5.1 MB', 'date': '22 дек 2023', 'year': '2023', 'category': 'photos'},
                {'id': '4', 'name': 'IMG_2023_089.jpg', 'size': '4.5 MB', 'date': '10 июн 2023', 'year': '2023', 'category': 'photos'},
                {'id': '5', 'name': 'IMG_2022_234.jpg', 'size': '3.9 MB', 'date': '5 май 2022', 'year': '2022', 'category': 'photos'},
            ],
            'videos': [
                {'id': '1', 'name': 'video_2024_summer.mp4', 'size': '124 MB', 'date': '10 авг 2024', 'category': 'videos'},
                {'id': '2', 'name': 'family_trip.mov', 'size': '89 MB', 'date': '5 июл 2024', 'category': 'videos'},
            ],
            'documents': [
                {'id': '1', 'name': 'Отчет_2024.pdf', 'size': '2.1 MB', 'date': '20 окт 2024', 'category': 'documents'},
                {'id': '2', 'name': 'Договор.docx', 'size': '145 KB', 'date': '18 окт 2024', 'category': 'documents'},
            ],
            'movies': [
                {'id': '1', 'name': 'Inception.mkv', 'size': '8.5 GB', 'date': '12 сен 2024', 'category': 'movies'},
            ],
            'work': [
                {'id': '1', 'name': 'Presentation.pptx', 'size': '15 MB', 'date': '18 окт 2024', 'category': 'work'},
            ],
            'software': [
                {'id': '1', 'name': 'vscode-installer.exe', 'size': '95 MB', 'date': '1 окт 2024', 'category': 'software'},
            ],
            'music': [
                {'id': '1', 'name': 'Playlist_Summer.mp3', 'size': '6.8 MB', 'date': '20 июл 2024', 'category': 'music'},
            ],
            'archives': [
                {'id': '1', 'name': 'backup_2024.zip', 'size': '1.2 GB', 'date': '1 окт 2024', 'category': 'archives'},
            ],
        }
        
        files = mock_files.get(category, [])
        
        if year:
            files = [f for f in files if f.get('year') == year]
        
        if search:
            files = [f for f in files if search.lower() in f['name'].lower()]
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'files': files, 'count': len(files)}),
            'isBase64Encoded': False
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        file_name = body_data.get('name', 'unnamed')
        category = body_data.get('category', 'documents')
        file_content = body_data.get('content', '')
        
        result = {
            'success': True,
            'file': {
                'id': f'file_{datetime.now().timestamp()}',
                'name': file_name,
                'category': category,
                'size': f'{len(file_content) / 1024:.1f} KB',
                'date': datetime.now().strftime('%d %b %Y'),
                'uploaded_at': datetime.now().isoformat()
            },
            'message': f'Файл {file_name} успешно загружен'
        }
        
        return {
            'statusCode': 201,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(result),
            'isBase64Encoded': False
        }
    
    if method == 'DELETE':
        params = event.get('queryStringParameters', {}) or {}
        file_id = params.get('id')
        
        if not file_id:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'File ID required'}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'success': True, 'message': f'File {file_id} deleted'}),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
