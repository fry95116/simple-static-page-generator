$(document).ready(function(){
    var $sideBar = $('.side-bar')

    $sideBar.find('.classItem').click(function(e){
        var $el = $(e.currentTarget)
        if($el.is('.active')){
            $el.removeClass('active')
            applyFliter('')
        }
        else{
            applyFliter($el.attr('data-class-name'))
            $el.addClass('active').siblings().removeClass('active')
        }

        e.stopPropagation()
    })
    $sideBar.hide()

    
    $('.side-bar-toggler').click(function(e){
        toggleSideBar()
        e.stopPropagation()

    })
    $('body').click(function(){
        hideSideBar()
    })

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

function applyFliter(className){
    $('.essay').each(function(i, el){
        var $el = $(el)
        if(className == null || className === '') $el.show()
        else if(className === $el.attr('data-class-name')) $el.show()
        else $el.hide()
    })
}