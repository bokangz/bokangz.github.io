$(function () {
    // resize window
    $(window).resize(function () {
        if ($(window).width() < 1280 && $(window).width() > 540) {
            $(".page").css({ "width": $(window).width() - $(".side-card").width() - 90, "float": "left" })
        } else {
            $(".page").removeAttr("style")
        }
    });

    // menu
    $(".menus_icon").click(function () {
        if ($(".header_wrap").hasClass("menus-open")) {
            $(".header_wrap").removeClass("menus-open").addClass("menus-close")
        } else {
            $(".header_wrap").removeClass("menus-close").addClass("menus-open")
        }
    })

    $(".m-social-links").click(function () {
        if ($(".author-links").hasClass("is-open")) {
            $(".author-links").removeClass("is-open").addClass("is-close")
        } else {
            $(".author-links").removeClass("is-close").addClass("is-open")
        }
    })

    $(".site-nav").click(function () {
        if ($(".nav").hasClass("nav-open")) {
            $(".nav").removeClass("nav-open").addClass("nav-close")
        } else {
            $(".nav").removeClass("nav-close").addClass("nav-open")
        }
    })

    $(document).click(function (e) {
        var target = $(e.target);
        if (target.closest(".nav").length != 0) return;
        $(".nav").removeClass("nav-open").addClass("nav-close")
        if (target.closest(".author-links").length != 0) return;
        $(".author-links").removeClass("is-open").addClass("is-close")
        if ((target.closest(".menus_icon").length != 0) || (target.closest(".menus_items").length != 0)) return;
        $(".header_wrap").removeClass("menus-open").addClass("menus-close")
    })

    // 显示 cdtop
    $(document).ready(function ($) {
        var offset = 100,
            scroll_top_duration = 700,
            $back_to_top = $('.nav-wrap');

        $(window).scroll(function () {
            ($(this).scrollTop() > offset) ? $back_to_top.addClass('is-visible') : $back_to_top.removeClass('is-visible');
        });

        $(".cd-top").on('click', function (event) {
            event.preventDefault();
            $('body,html').animate({
                scrollTop: 0,
            }, scroll_top_duration);
        });
    });

    // pjax
    $(document).pjax('a[target!=_blank]', '.page', {
        fragment: '.page',
        timeout: 5000,
        cache: false
    });
    $(document).on({
        'pjax:click': function () {
            $('body,html').animate({
                scrollTop: 0,
            }, 700);
        },
        'pjax:end': function () {
            if ($(".header_wrap").hasClass("menus-open")) {
                $(".header_wrap").removeClass("menus-open").addClass("menus-close")
            }
            if ($(".author-links").hasClass("is-open")) {
                $(".author-links").removeClass("is-open").addClass("is-close")
            }
            if ($(".nav").hasClass("nav-open")) {
                $(".nav").removeClass("nav-open").addClass("nav-close")
            }
            // Handle visitor map: only show on homepage
            // First, always remove map from non-homepage
            var pathname = window.location.pathname;
            // Homepage detection: only root path or /index.html
            // Exclude /cv/, /misc/, /publication/ etc.
            var isHomePage = pathname === '/' || pathname === '/index.html' || 
                            (pathname === '/bokangz.github.io/' || pathname === '/bokangz.github.io/index.html');
            
            if (!isHomePage) {
                // Remove map if not on homepage - do this first and thoroughly
                // Remove script tag
                $('#mapmyvisitors').remove();
                // Remove table containing map script (multiple selectors to be sure)
                $('table:has(script[id="mapmyvisitors"])').remove();
                $('table:has(script[src*="mapmyvisitors"])').remove();
                // Remove any table with width 25% that might contain the map
                $('table[style*="width:25%"]').each(function() {
                    var $table = $(this);
                    var hasMapScript = $table.find('script#mapmyvisitors').length > 0 || 
                                      $table.find('script[src*="mapmyvisitors"]').length > 0 ||
                                      ($table.find('script').length > 0 && $table.find('script').attr('src') && $table.find('script').attr('src').indexOf('mapmyvisitors') !== -1);
                    if (hasMapScript) {
                        $table.next('div[style*="height:100px"]').remove();
                        $table.remove();
                        return;
                    }
                });
                // Remove any map-related iframes or divs created by the map script
                $('iframe[src*="mapmyvisitors"], div[id*="mapmyvisitors"], iframe[src*="mapmyvisitors.com"]').remove();
                // Remove spacing div that follows map table
                $('div[style*="height:100px"]').each(function() {
                    var $div = $(this);
                    var prevTable = $div.prev('table[style*="width:25%"]');
                    if (prevTable.length > 0) {
                        $div.remove();
                    }
                });
                // Force remove any remaining map elements - be very aggressive
                $('script[src*="mapmyvisitors"]').remove();
                $('table').each(function() {
                    if ($(this).find('script[src*="mapmyvisitors"]').length > 0) {
                        $(this).remove();
                    }
                });
            } else if (isHomePage) {
                // Re-execute map script after PJAX loads
                setTimeout(function() {
                    // Check if map already exists and is working
                    var existingMap = $('#mapmyvisitors');
                    // More precise selector for map table - must contain the map script
                    var mapTable = $('table:has(script#mapmyvisitors)');
                    if (mapTable.length === 0) {
                        mapTable = $('table[style*="width:25%"]').filter(function() {
                            return $(this).find('script[src*="mapmyvisitors"]').length > 0;
                        });
                    }
                    
                    // If map script doesn't exist or table doesn't exist, create it
                    if (existingMap.length === 0 || mapTable.length === 0) {
                        // Remove any existing map elements first
                        existingMap.remove();
                        mapTable.remove();
                        $('div[style*="height:100px"]').filter(function() {
                            return $(this).prev('table[style*="width:25%"]').length > 0;
                        }).remove();
                        
                        // Find the article element to append map after publications list
                        var article = $('article');
                        if (article.length > 0) {
                            // Find the last ul in article (should be the publications list)
                            var lastUl = article.find('ul').last();
                            if (lastUl.length > 0) {
                                // Create map table
                                var newMapTable = $('<table>', {
                                    style: 'width:25%;border:0px;border-spacing:0px;border-collapse:separate;margin-right:auto;margin-left:auto;margin-top:40px;margin-bottom:80px;background:transparent;'
                                });
                                var tbody = $('<tbody>');
                                var tr = $('<tr>');
                                var td = $('<td>', {
                                    style: 'padding:0px;background:transparent;border:none;'
                                });
                                var br = $('<br>');
                                var p = $('<p>', {
                                    style: 'margin:0;padding:0;background:transparent;'
                                });
                                
                                // Create and append script
                                var newScript = document.createElement('script');
                                newScript.type = 'text/javascript';
                                newScript.id = 'mapmyvisitors';
                                newScript.src = '//mapmyvisitors.com/map.js?d=7OijN6CN3khyTc_L_ChyYzkzza3k9Zkx9DDczqCwhJI&cl=ffffff&w=a';
                                
                                p.append(newScript);
                                td.append(br).append(p);
                                tr.append(td);
                                tbody.append(tr);
                                newMapTable.append(tbody);
                                
                                // Append map table and spacing div after last ul
                                lastUl.after(newMapTable);
                                newMapTable.after($('<div>', {style: 'height:100px;'}));
                            }
                        }
                    } else {
                        // Map exists, but script may not have executed, force reload
                        var scriptSrc = existingMap.attr('src');
                        if (scriptSrc) {
                            existingMap.remove();
                            var newScript = document.createElement('script');
                            newScript.type = 'text/javascript';
                            newScript.id = 'mapmyvisitors';
                            newScript.src = scriptSrc;
                            mapTable.find('p').append(newScript);
                        }
                    }
                }, 300);
            }
        }
    });

    // smooth scroll
    $(function () {
        $('a[href*=\\#]:not([href=\\#])').click(function () {
            if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
                var target = $(this.hash);
                target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
                if (target.length) {
                    $('html,body').animate({
                        scrollTop: target.offset().top
                    }, 700);
                    return false;
                }
            }
        });
    });

    $(function () {
        $('h3 a').attr('target', '_blank');
        $('h3 a').attr('target', '_blank');
    })

    // Initialize map on page load (for non-PJAX navigation)
    $(document).ready(function() {
        var pathname = window.location.pathname;
        // Homepage detection: only root path or /index.html
        // Exclude /cv/, /misc/, /publication/ etc.
        var isHomePage = pathname === '/' || pathname === '/index.html' || 
                        (pathname === '/bokangz.github.io/' || pathname === '/bokangz.github.io/index.html');
        if (!isHomePage) {
            // Thoroughly remove map from non-homepage - be very aggressive
            $('#mapmyvisitors').remove();
            $('table:has(script[id="mapmyvisitors"])').remove();
            $('table:has(script[src*="mapmyvisitors"])').remove();
            $('table[style*="width:25%"]').each(function() {
                var $table = $(this);
                var hasMapScript = $table.find('script#mapmyvisitors').length > 0 || 
                                  $table.find('script[src*="mapmyvisitors"]').length > 0 ||
                                  ($table.find('script').length > 0 && $table.find('script').attr('src') && $table.find('script').attr('src').indexOf('mapmyvisitors') !== -1);
                if (hasMapScript) {
                    $table.next('div[style*="height:100px"]').remove();
                    $table.remove();
                    return;
                }
            });
            $('iframe[src*="mapmyvisitors"], div[id*="mapmyvisitors"], iframe[src*="mapmyvisitors.com"]').remove();
            $('div[style*="height:100px"]').each(function() {
                var $div = $(this);
                var prevTable = $div.prev('table[style*="width:25%"]');
                if (prevTable.length > 0) {
                    $div.remove();
                }
            });
            // Force remove any remaining map elements
            $('script[src*="mapmyvisitors"]').remove();
            $('table').each(function() {
                if ($(this).find('script[src*="mapmyvisitors"]').length > 0) {
                    $(this).remove();
                }
            });
        }
    });

})