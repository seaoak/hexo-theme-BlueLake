(function() { (function mainOfSearchJSON() {
    'use strict';
    if (document.readyState !== 'complete') {
        // Multiple identical event listeners are safe:
        // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#Multiple_identical_event_listeners
        document.addEventListener('readystatechange', mainOfSearchJSON, false);
        return;
    }
    var keyInput = document.getElementById('search-key'),
        searchForm = document.getElementById('search-form'),
        searchWrap = document.getElementById('result-wrap'),
        searchResult = document.getElementById('search-result'),
        searchTpl = document.getElementById('search-tpl').innerHTML,
        searchData;
    function loadData(success) {
        if (!searchData) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', '/content.json', true);
            xhr.onload = function() {
                if (this.status >= 200 && this.status < 300) {
                    var res = JSON.parse(this.response||this.responseText);
                    searchData = res instanceof Array ? res : res.posts;
                    success(searchData);
                } else {
                    console.error(this.statusText);
                }
            };
            xhr.onerror = function() {
                console.error(this.statusText);
            };
            xhr.send();
        } else {
            success(searchData);
        }
    }
    function matcher(post, regExp) {
        return regtest(post.title, regExp) || post.tags.some(function(tag) {
            return regtest(tag.name, regExp);
        }) || regtest(post.text, regExp);
    }
    function regtest(raw, regExp) {
        regExp.lastIndex = 0;
        return regExp.test(raw);
    }
    function render(data) {
        var html = '';
        if (data.length) {
            html = data.map(function(post) {
                return tpl(searchTpl, {
                    title: post.title,
                    path: post.path,
                    date: new Date(post.date).toLocaleDateString(),
                    tags: post.tags.map(function(tag) {
                        return '<span>' + tag.name + '</span>';
                    }).join('')
                });
            }).join('');
        } else {
            html = '<div class="tips"><i class="fa fa-empty"></i><p>Results not found!</p></div>';
        }
        searchResult.innerHTML = html;
    }
    function tpl(html, data) {
        return html.replace(/\{\w+\}/g, function(str) {
            var prop = str.replace(/\{|\}/g, '');
            return data[prop] || '';
        });
    }
    function hasClass(obj, cls) {
        return obj.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
    }
    function addClass(obj, cls) {
        if (!hasClass(obj, cls)) obj.className += " " + cls;
    }
    function removeClass(obj, cls) {
        if (hasClass(obj, cls)) {
            var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
            obj.className = obj.className.replace(reg, ' ');
        }
    }
    function search(e) {
        var key = this.value.trim();
        if (!key) {
            addClass(searchWrap, 'hide');
            return;
        }
        var regExp = new RegExp(key.replace(/[ ]/g, '|'), 'gmi');
        loadData(function(data) {
            var result = data.filter(function(post) {
                return matcher(post, regExp);
            });
            render(result);
        });
        e.preventDefault();
        removeClass(searchWrap, 'hide');
    }
    function handlerForEscKey(e) {
        // 'keypress' event is never fired for ESC key.
        // 'keyup' event is emitted when the input should be captured by IME.
        if (e.defaultPrevented) {
            return;
        }
        if (e.key !== 'Escape') {
            return;
        }
        this.value = '';
        search.call(this, null);
    }
    function handlerForClick(e) {
        if (e.defaultPrevented) {
            return;
        }
        if (searchForm.contains(e.target)) {
            return;
        }
        addClass(searchWrap, 'hide');
    }
    keyInput.addEventListener('focus', search);
    keyInput.addEventListener('input', search);
    keyInput.addEventListener('keydown', handlerForEscKey);
    window.addEventListener('click', handlerForClick);
})();})();
