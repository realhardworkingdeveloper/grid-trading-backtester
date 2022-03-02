/*
Template Name: CryptoLand - Crypto Currency Landing Page Template.
Author: GrayGrids
*/

(function () {
    //===== Prealoder

    window.onload = function () {
        window.setTimeout(fadeout, 500);

        var from_$input = $('#input_from').pickadate(),
          from_picker = from_$input.pickadate('picker')
      
        var to_$input = $('#input_to').pickadate(),
          to_picker = to_$input.pickadate('picker')
      
      
        // Check if there’s a “from” or “to” date to start with.
        if ( from_picker.get('value') ) {
          to_picker.set('min', from_picker.get('select'))
        }
        if ( to_picker.get('value') ) {
          from_picker.set('max', to_picker.get('select'))
        }
      
        // When something is selected, update the “from” and “to” limits.
        from_picker.on('set', function(event) {
          if ( event.select ) {
            to_picker.set('min', from_picker.get('select'))    
          }
          else if ( 'clear' in event ) {
            to_picker.set('min', false)
          }
        })
        to_picker.on('set', function(event) {
          if ( event.select ) {
            from_picker.set('max', to_picker.get('select'))
          }
          else if ( 'clear' in event ) {
            from_picker.set('max', false)
          }
        })
    }

    function fadeout() {
        document.querySelector('.preloader').style.opacity = '0';
        document.querySelector('.preloader').style.display = 'none';
    }

    // WOW active
    new WOW().init();

    //===== mobile-menu-btn
    let navbarToggler = document.querySelector(".mobile-menu-btn");
    navbarToggler.addEventListener('click', function () {
        navbarToggler.classList.toggle("active");
    });


})();