FROM nginx:alpine
COPY index.html /usr/share/nginx/html/
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/
COPY video/ /usr/share/nginx/html/video/
COPY images/ /usr/share/nginx/html/images/
EXPOSE 80
