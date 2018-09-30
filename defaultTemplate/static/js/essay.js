$(document).ready(function(){
    var $sideBar = $('.side-bar')

    $sideBar.find('.index-item').click(function(e){
        var $el = $(e.currentTarget)
        $el.addClass('active').siblings().removeClass('active')
        var $next = $el.next()
        if($next.is('.index-item-sub')){
            if($next.is(':visible')){
                $el
                    .find('i.fas')
                    .removeClass('fa-angle-down')
                    .addClass('fa-angle-left')
                $next.hide()
            }
            else{
                $el
                    .find('i.fas')
                    .removeClass('fa-angle-left')
                    .addClass('fa-angle-down')
                $next.show()
            }
        }
        // window.location.href = $el.attr('href')
        // e.stopPropagation()
    })
    // $('.index-item-sub').hide()
    // $sideBar.hide()

    
    $('.side-bar-toggler').click(function(e){
        toggleSideBar()
        e.stopPropagation()

    })
    // $('body').click(function(){
    //     hideSideBar()
    // })

    function toggleSideBar(){
        $sideBar.is(':visible') ? hideSideBar() : showSideBar()
    }

    function showSideBar(){
        $('.side-bar-toggler')
            .addClass('active')
            .find('i')
            .removeClass('fa-bars')
            .addClass('fa-arrow-left')
        $sideBar.show()
    }

    function hideSideBar(){
        $('.side-bar-toggler')
            .removeClass('active')
            .find('i')
            .removeClass('fa-arrow-left')
            .addClass('fa-bars')
        $sideBar.hide()
    }

})
