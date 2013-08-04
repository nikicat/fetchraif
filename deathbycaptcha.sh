#!/bin/sh

username=$1
password=$2
filename=$3

api='http://api.dbcapi.me/api/captcha'

resp=`curl -s --header 'Expect: ' -F username=$username -F password=$password -F captchafile=@$filename $api`
captchaid=`echo $resp | sed -r 's/.*captcha=([0-9]+).*/\1/'`

text=''
while [ "$text" = '' ] ; do
    sleep 3
    resp=`curl -s $api/$captchaid`
    text=`echo $resp | sed -r 's/.*text=([0-9]*).*/\1/'`
done

echo $text
