fetchraif.js
===========

Script to fetch account and card statements from [Raiffeisen Connect](https://connect.raiffeisen.ru) (tested only with russian Raiffeisen branch).
It uses [casperjs](http://casperjs.org/) (based on phantomjs, which uses webkit as engine) to load R-Connect and navigate to statements.
Login captcha could be decoded manually using [yad](http://code.google.com/p/yad/) (zenity fork) or automatically using [deathbycaptcha.com](http://deathbycaptcha.com) service (paid, 6.95$ for 5K captchas).

Requirements:
 -   [casperjs](http://casperjs.org/)
 -   [yad](http://code.google.com/p/yad/) (for manual captcha decoding)

Installation (for ArchLinux):

    yaourt -S yad casperjs
    git clone https://github.com/nikicat/fetchraif.git

Usage:

    ./fetchraif.js --captcha-decoder=[deathby|antigate|manual] \
      --raif-login=RCONNECT_LOGIN --raif-password=RCONNECT_PASS \
      [--deathby-login=DEATHBY_LOGIN --deathby-password=DEATHBY_PASS|--antigate-key=ANTIGATE_KEY]
As a result there will be several `statement.*.csv` files, one for each card and one for each account.

In case of any problems debug output could be enabled using these options

    casperjs --direct --log-level=debug ./fetchraif.js ...
For more info see [casperjs docs](http://docs.casperjs.org)
