#!/usr/bin/env python3
"""Local zero-dependency HTTP server for World Life 2.1 (ES Modules MIME-safe)."""
import http.server
import os
import socketserver
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
ROOT = os.path.dirname(os.path.abspath(__file__))
os.chdir(ROOT)

class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        '.js': 'application/javascript; charset=utf-8',
        '.mjs': 'application/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.woff2': 'font/woff2',
    }
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

class ThreadedTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    allow_reuse_address = True

if __name__ == '__main__':
    with ThreadedTCPServer(('127.0.0.1', PORT), Handler) as httpd:
        print(f"World Life 2.1 running at http://127.0.0.1:{PORT}")
        sys.stdout.flush()
        httpd.serve_forever()
