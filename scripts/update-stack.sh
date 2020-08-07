#!/bin/bash
aws cloudformation --region us-east-2 update-stack \
--stack-name xsrt \
--template-body file://infrastructure/app/main.yml \
--capabilities CAPABILITY_AUTO_EXPAND \
--tags Key=App,Value=xsrt Key=Env,Value=dev \
--parameters ParameterKey=WildcardCert,ParameterValue=arn:aws:acm:us-east-1:307651132348:certificate/a7251717-c686-4b81-8f38-6bc384bf9930
