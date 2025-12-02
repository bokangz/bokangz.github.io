#!/usr/bin/env python3
"""
Local development server script
Temporarily modifies the base tag in all HTML files to / for local development
Restores the original base tag when the server is stopped with Ctrl+C
"""

import os
import re
import signal
import sys
import http.server
import socketserver
from pathlib import Path

# List of HTML files to modify
HTML_FILES = [
    'index.html',
    'cv/index.html',
    'publication/index.html',
    'publication/content.html',
    'publication/ref.html',
]

# Backup dictionary for restoration
backups = {}

def modify_base_for_local():
    """Modify base tag to / for local development"""
    for html_file in HTML_FILES:
        file_path = Path(html_file)
        if file_path.exists():
            content = file_path.read_text(encoding='utf-8')
            # Save original content
            backups[html_file] = content
            # Replace base tag
            modified = re.sub(
                r'<base href="/bokangz\.github\.io/">',
                '<base href="/">',
                content
            )
            file_path.write_text(modified, encoding='utf-8')
            print(f"✓ Modified {html_file} for local development")

def restore_base_for_production():
    """Restore base tag to production environment configuration"""
    for html_file, original_content in backups.items():
        file_path = Path(html_file)
        if file_path.exists():
            file_path.write_text(original_content, encoding='utf-8')
            print(f"✓ Restored {html_file} to production configuration")

def signal_handler(sig, frame):
    """Handle Ctrl+C signal"""
    print("\n\nStopping server and restoring files...")
    restore_base_for_production()
    print("✓ Files restored, safe to commit to Git")
    sys.exit(0)

def main():
    PORT = 8000
    
    # Register signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    print("=" * 50)
    print("Local Development Server")
    print("=" * 50)
    print(f"Modifying HTML files for local development...")
    
    # Modify base tags
    modify_base_for_local()
    
    print(f"\nStarting server at http://localhost:{PORT}")
    print("Press Ctrl+C to stop the server (files will be auto-restored)\n")
    
    # Start HTTP server
    os.chdir(Path(__file__).parent)
    Handler = http.server.SimpleHTTPRequestHandler
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass

if __name__ == '__main__':
    main()

