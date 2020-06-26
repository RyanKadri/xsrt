FROM nginx:1.15.8 as static-frontend
COPY conf/nginx.conf.template /etc/nginx
EXPOSE 443
