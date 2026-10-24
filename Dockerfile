FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html privacidade.html /usr/share/nginx/html/
COPY raizes-que-curam/ /usr/share/nginx/html/raizes-que-curam/
COPY rede-de-agentes/ /usr/share/nginx/html/rede-de-agentes/
COPY aprender/ /usr/share/nginx/html/aprender/
COPY multiplicar/ /usr/share/nginx/html/multiplicar/
COPY festival/ /usr/share/nginx/html/festival/
COPY faca-parte/ /usr/share/nginx/html/faca-parte/
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/
COPY assets/ /usr/share/nginx/html/assets/
EXPOSE 80
