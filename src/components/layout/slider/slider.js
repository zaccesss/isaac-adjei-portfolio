//Full Documentation: https://animmaster.github.io/docs/swiper.html

/*
========================================================
ANIM SLIDER MODULE
========================================================

Modern slider powered by Swiper.


--------------------------------------------------------
HTML STRUCTURE
--------------------------------------------------------

snippet: swiper

<div data-anim-slider class="swiper">

	<div class="swiper-wrapper">

		<div class="swiper-slide">
			slide content
		</div>

	</div>

</div>


<!-- Snippet HTML for full swiper: swiperfull -->

<div class="block-name__slider swiper" data-anim-slider>

	<div class="block-name__wrapper swiper-wrapper">
		<div class="block-name__slide swiper-slide"></div>
	</div>

	<div class="swiper-pagination"></div>

	<button type="button" class="swiper-button-prev"></button>
	<button type="button" class="swiper-button-next"></button>

	<div class="swiper-scrollbar"></div>

</div>



--------------------------------------------------------
ATTRIBUTES
--------------------------------------------------------

data-anim-slider


Docs
https://swiperjs.com/

========================================================
*/
/*
Documentation for working in the template:
Slider documentation: https://swiperjs.com/
Snippet (HTML): swiper
*/

// Import the Swiper slider from node_modules
// If needed, import additional slider modules by listing them in {} separated by commas
// Example: { Navigation, Autoplay }
import Swiper from 'swiper'
import { Navigation } from 'swiper/modules'
/*
Main slider modules:
Navigation, Pagination, Autoplay,
EffectFade, Lazy, Manipulation
See https://swiperjs.com/ for details
*/

// Swiper styles
// Import base styles
import './slider.scss'
// Full bundle of styles from node_modules
// import 'swiper/css/bundle';

// Initialize sliders
function initSliders() {
	// List of sliders
	// Check if there is a slider on the page
	if (document.querySelector('.swiper')) {
		// <- Specify the class of the needed slider
		// Create slider
		new Swiper('.swiper', {
			// <- Specify the class of the needed slider
			// Connect slider modules
			// for this specific case
			modules: [Navigation],
			observer: true,
			observeParents: true,
			slidesPerView: 1,
			spaceBetween: 0,
			// autoHeight: true,
			speed: 800,

			// touchRatio: 0,
			// simulateTouch: false,
			// loop: true,
			// preloadImages: false,
			// lazy: true,

			/*
			// Effects
			effect: 'fade',
			autoplay: {
				delay: 3000,
				disableOnInteraction: false,
			},
			*/

			// Pagination
			/*
			pagination: {
				el: '.swiper-pagination',
				clickable: true,
			},
			*/

			// Scrollbar
			/*
			scrollbar: {
				el: '.swiper-scrollbar',
				draggable: true,
			},
			*/

			// Prev/Next buttons
			navigation: {
				prevEl: '.swiper-button-prev',
				nextEl: '.swiper-button-next',
			},

			/*
			// Breakpoints
			breakpoints: {
				640: {
					slidesPerView: 1,
					spaceBetween: 0,
					autoHeight: true,
				},
				768: {
					slidesPerView: 2,
					spaceBetween: 20,
				},
				992: {
					slidesPerView: 3,
					spaceBetween: 20,
				},
				1268: {
					slidesPerView: 4,
					spaceBetween: 30,
				},
			},
			*/

			// Events
			on: {},
		})
	}
}

document.querySelector('[data-anim-slider]')
	? window.addEventListener('load', initSliders)
	: null
