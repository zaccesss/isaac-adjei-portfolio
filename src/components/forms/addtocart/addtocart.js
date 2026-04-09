//Full Documentation: https://animmaster.github.io/docs/addcard.html

/*
========================================================
ANIM ADD TO CART MODULE
========================================================

Animated add-to-cart system with fly image effect.


--------------------------------------------------------
HTML STRUCTURE
--------------------------------------------------------

<div data-anim-addtocart>0</div>

<div data-anim-addtocart-product>

	<img
		src="product.jpg"
		data-anim-addtocart-image="500"
	/>

	<input
		type="number"
		value="1"
		data-anim-addtocart-quantity
	/>

	<button data-anim-addtocart-button>
		Add to cart
	</button>

</div>



--------------------------------------------------------
ATTRIBUTES
--------------------------------------------------------

data-anim-addtocart
cart counter element


data-anim-addtocart-product
product wrapper


data-anim-addtocart-button
add button


data-anim-addtocart-image
product image used for fly animation


data-anim-addtocart-image="500"
animation speed


data-anim-addtocart-quantity
product quantity input



--------------------------------------------------------
FEATURES
--------------------------------------------------------

✔ fly to cart animation
✔ quantity support
✔ lightweight
✔ multiple products


========================================================
*/

// Import functionality
import { ANIM } from '@js/common/functions.js'

// Styles
import './addtocart.scss'

function addToCart() {
	const cart = document.querySelector('[data-anim-addtocart]')

	if (!cart) return

	ANIM('_ANIM_ADD_TO_CART_START')

	document.addEventListener('click', e => {
		const button = e.target.closest('[data-anim-addtocart-button]')

		if (!button) return

		const product = button.closest('[data-anim-addtocart-product]')

		if (!product) {
			cart.innerHTML = +cart.innerHTML + 1
			return
		}

		let quantityInput = product.querySelector('[data-anim-addtocart-quantity]')

		const quantity = quantityInput ? +quantityInput.value : 1

		const image = product.querySelector('[data-anim-addtocart-image]')

		const flySpeed = image?.dataset.animAddtocartImage
			? +image.dataset.animAddtocartImage
			: 500

		if (image) {
			flyImage(image, cart, flySpeed)
		}

		setTimeout(
			() => {
				cart.innerHTML = +cart.innerHTML + quantity
			},
			image ? flySpeed : 0,
		)
	})

	function flyImage(image, cart, speed) {
		const rect = image.getBoundingClientRect()

		const flyImg = document.createElement('img')

		flyImg.src = image.src

		flyImg.style.cssText = `
			position:absolute;
			left:${rect.left + scrollX}px;
			top:${rect.top + scrollY}px;
			width:${image.offsetWidth}px;
			pointer-events:none;
			transition:all ${speed}ms ease;
			z-index:9999;
		`

		document.body.append(flyImg)

		const cartRect = cart.getBoundingClientRect()

		requestAnimationFrame(() => {
			flyImg.style.left = `${cartRect.left + scrollX}px`
			flyImg.style.top = `${cartRect.top + scrollY}px`
			flyImg.style.width = `0`
			flyImg.style.opacity = `0`
		})

		setTimeout(() => flyImg.remove(), speed)
	}
}

if (document.querySelector('[data-anim-addtocart]')) {
	window.addEventListener('load', addToCart)
}
