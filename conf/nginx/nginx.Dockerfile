FROM nginx:1.15.8
COPY conf/nginx/nginx.conf.template /etc/nginx
EXPOSE 443
