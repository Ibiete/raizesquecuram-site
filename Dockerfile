FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html privacidade.html /usr/share/nginx/html/
COPY raizes-que-curam/ /usr/share/nginx/html/raizes-que-curam/
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/
COPY assets/ /usr/share/nginx/html/assets/
EXPOSE 80
