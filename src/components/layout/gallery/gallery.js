// animmaster docs: https://animmaster.github.io/docs/gallery.html
/*
Template documentation: https://www.lightgalleryjs.com/docs/
Plugin documentation: https://www.lightgalleryjs.com/docs/

// Plugins
// lgZoom, lgAutoplay, lgComment, lgFullscreen, lgHash, lgPager, lgRotate, lgShare, lgThumbnail, lgVideo, lgMediumZoom
// import lgThumbnail from 'lightgallery/plugins/thumbnail/lg-thumbnail.min.js'
// import lgZoom from 'lightgallery/plugins/zoom/lg-zoom.min.js'


// Add-on styles
// import './assets/lg-transitions.css';
// import './assets/lg-thumbnail.css';
// import './assets/lg-video.css';
// import './assets/lg-autoplay.css';
// import './assets/lg-zoom.css';
// import './assets/lg-pager.css';
// import './assets/lg-fullscreen.css';
// import './assets/lg-share.css';
// import './assets/lg-comments.css';
// import './assets/lg-rotate.css';
// import './assets/lg-medium-zoom.css';
// import './assets/lg-relative-caption.css';

// All styles
// import './assets/lightgallery-bundle.css';

/*
const galleries = document.querySelectorAll('[data-anim-gallery]');
if (galleries.length) {
	galleries.forEach(gallery => {
		lightGallery(gallery, {
			// plugins: [lgZoom, lgThumbnail],
			licenseKey: KEY,
			speed: 500,
		});
	});
}
*/


/*
========================================================
ANIM GALLERY MODULE
========================================================

Image / video lightbox gallery powered by LightGallery.


--------------------------------------------------------
HTML STRUCTURE
--------------------------------------------------------

<div data-anim-gallery>

	<a href="img/1.jpg">
		<img src="img/1.jpg" alt="">
	</a>

	<a href="img/2.jpg">
		<img src="img/2.jpg" alt="">
	</a>

	<a href="img/3.jpg">
		<img src="img/3.jpg" alt="">
	</a>

</div>



--------------------------------------------------------
ATTRIBUTE
--------------------------------------------------------

data-anim-gallery
gallery wrapper



--------------------------------------------------------
FEATURES
--------------------------------------------------------

✔ image lightbox
✔ video support
✔ zoom
✔ thumbnails
✔ swipe gestures
✔ mobile support
✔ fullscreen
✔ keyboard navigation



--------------------------------------------------------
OPTIONAL PLUGINS
--------------------------------------------------------

lgZoom
lgThumbnail
lgVideo
lgAutoplay
lgFullscreen
lgShare
lgRotate
lgMediumZoom



--------------------------------------------------------
DOCS
--------------------------------------------------------

https://www.lightgalleryjs.com/docs/

========================================================
*/


// Import functionality
import { ANIM } from '@js/common/functions.js'

// LightGallery core
import lightGallery from 'lightgallery'

// License key
const KEY = '7EC452A9-0CFD441C-BD984C7C-17C8456E'


// Optional plugins
// import lgZoom from 'lightgallery/plugins/zoom/lg-zoom.min.js'
// import lgThumbnail from 'lightgallery/plugins/thumbnail/lg-thumbnail.min.js'


// Base styles
import './assets/lightgallery.css'


/* ------------------------------------------------
Gallery initialization
------------------------------------------------ */

function initGallery() {

	const galleries = document.querySelectorAll('[data-anim-gallery]')

	if (!galleries.length) return

	ANIM('_ANIM_GALLERY_INIT', galleries.length)

	galleries.forEach(gallery => {

		lightGallery(gallery, {

			licenseKey: KEY,

			selector: 'a',

			speed: 500,

			// plugins: [lgZoom, lgThumbnail],

		})

	})

}


/* ------------------------------------------------
Auto init
------------------------------------------------ */

if (document.querySelector('[data-anim-gallery]')) {

	window.addEventListener('load', initGallery)

}