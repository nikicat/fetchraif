#!/bin/sh

antigatekey=$1
filename=$2

useragent="Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; WOW64; Trident/6.0)"

antigate=$(curl --silent -q --user-agent "$useragent" -F "method=post" -F "key=$antigatekey" -F "numeric=1" -F "min_len=8" -F "max_len=8" -F "file=@$filename;type=image/png" "http://antigate.com/in.php")

if [[ $(echo "$antigate" | grep "ERROR") ]];then
    exit 1
else
    antigatecaptchaid=$(echo "$antigate" | sed -e 's/OK|//g')
fi

sleep 5

while [[ ! $(echo "$captchastatus" | grep 'OK|') ]]; do
    sleep 2
    local captchastatus=$(curl --silent -q --user-agent "$useragent" "http://antigate.com/res.php?key=$antigatekey&action=get&id=$antigatecaptchaid")
    if [[ $(echo "$captchastatus" | grep 'ERROR') ]]; then
        exit 1
    fi
done

captchaanswer=$(echo "$captchastatus" | sed -e 's/OK|//g')
echo $captchaanswer
exit 0
