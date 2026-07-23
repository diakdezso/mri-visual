from http.server import SimpleHTTPRequestHandler, HTTPServer

class CORSRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')  # Allow all origins
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')  # Allow specific methods
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')  # Allow specific headers
        SimpleHTTPRequestHandler.end_headers(self)

if __name__ == "__main__":
    PORT = 8080  # Change the port if needed
    httpd = HTTPServer(('', PORT), CORSRequestHandler)
    print(f"Serving on port {PORT}")
    httpd.serve_forever()
