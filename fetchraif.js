#!/usr/bin/casperjs

var casper = require('casper').create();
var cp = require('child_process');
var page = require('webpage').create();

var captchaDecoders = {
    'deathby': {
        'cmd': './deathbycaptcha.sh',
        'args': [casper.cli.options['deathby-login'], casper.cli.options['deathby-password'], 'raif.png']
    },
    'antigate': {
        'cmd': './antigatecaptcha.sh',
        'args': [casper.cli.options['antigate-key'], 'raif.png']
    },
    'manual': {
        'cmd': 'yad',
        'args': ['--image', 'raif.png', '--entry']
    }
};

var captchaDecoder = captchaDecoders[casper.cli.options['captcha-decoder']];

if (Object.keys(casper.cli.options).length < 3) {
    casper.echo("usage: fetchraif.js --captcha-decoder=[deathby|antigate|manual] --raif-login=RCONNECT_LOGIN --raif-password=RCONNECT_PASS [--deathby-login=DEATHBY_LOGIN --deathby-password=DEATHBY_PASS --antigate-key=ANTIGATE_KEY]").exit();
}

casper.start('https://connect.raiffeisen.ru/rba/Login.do').then(function () {
    this.captureSelector('raif.png', 'img[title="Authorization code"]');

    var captcha = null;
    cp.execFile(captchaDecoder['cmd'], captchaDecoder['args'], {}, function (_, stdout, stderr) {
        captcha = stdout.substring(0, stdout.indexOf('\n'));
    });
    casper.waitFor(function check () {
        return captcha !== null;
    }, function () {
        casper.log('captcha: ' + captcha, 'debug');
        casper.sendKeys('form[name=ProductsViewBean] input[name=LOGIN_AUTHORIZATION_CODE]', captcha, {keepFocus: false});
    }, null, 30000);
}).then(function () {
    this.fill('form[name=ProductsViewBean]', {
        'USER_NAME': casper.cli.options['raif-login'],
        'USER_PASSWORD': casper.cli.options['raif-password'],
        'TMP_USER_PASSWORD': ''
    }, true);
}).wait(3000).then(function () {
    var cards = casper.evaluate(function () {
        var cards = [];
        var products = ['ACC', 'CARD', 'CREDITCARD'];
        for (var tab=0; tab<products.length; tab++) {
            $('#tabs0tab'+tab+' input[type=radio]').each(function (i, el) {
                var card = $(el).parent().text().substring(12,16);
                var value = $(el).val();
                cards.push({'number': card, 'id': value, 'product': products[tab]});
            });
        }
        return cards;
    });
    casper.log('found cards: '+cards, 'debug');
    casper.each(cards, function (i, card) {
        casper.then(function () {
            casper.click('a[id="pd0_PRODUCTS.ACCOUNTS"]');
        }).then(function () {
            casper.click('input[value="'+card['id']+'"][type=radio]');
        }).then(function () {
            casper.click('[id="PRODOP.'+card['product']+'.STATEMENT"]');
        }).then(function () {
            casper.fill('form[name$=StatementViewBean]', {
                'startDate': '01.01.2012',
                'maxPageItems': 3000
            }, true);
        }).then(function () {
            var href = casper.evaluate(function () {
                return $('a[href^="csv-"]')[0].href;
            });
            casper.download(href, 'statement.'+card['number']+'.csv');
        });
    });
});

casper.run();
