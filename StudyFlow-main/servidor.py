"""
Servidor local do StudyFlow para testes (computador e celular na mesma rede Wi-Fi).

Como usar, na pasta do projeto:
    python servidor.py

Depois abra http://localhost:5500 no computador, ou http://IP-DO-COMPUTADOR:5500 no celular.

Diferença para o "python -m http.server": este manda o navegador sempre conferir
se há versão nova dos arquivos, então as mudanças aparecem sem precisar limpar o cache.
"""
import http.server

PORTA = 5500


class SemCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()


if __name__ == "__main__":
    print(f"StudyFlow rodando em http://localhost:{PORTA}  (Ctrl+C para parar)")
    http.server.ThreadingHTTPServer(("", PORTA), SemCache).serve_forever()
