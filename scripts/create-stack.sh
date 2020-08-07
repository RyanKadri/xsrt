#!/bin/bash

aws cloudformation --region us-east-2 package \
--template-file ./infrastructure/app/main.yml \
--s3-bucket xsrt-cfn2 \
--output-template-file packaged-stack.yml

aws cloudformation --region us-east-2 create-stack \
--stack-name xsrt \
--template-body file://packaged-stack.yml \
--capabilities CAPABILITY_AUTO_EXPAND \
--tags Key=App,Value=xsrt Key=Env,Value=dev \
--parameters ParameterKey=WildcardCert,ParameterValue=arn:aws:acm:us-east-1:307651132348:certificate/a7251717-c686-4b81-8f38-6bc384bf9930
