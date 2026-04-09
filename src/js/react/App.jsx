import React from 'react'
import ReactDOM from 'react-dom/client'

import someImg from '@img/cover.jpg'

const App = () => (
	<>
		<h1 className='title'>React text</h1>
		{<img src={someImg} alt='Image' />}
	</>
)

// Element used for rendering
const root = document.querySelector('#root')
	? document.querySelector('#root')
	: document.querySelector('.wrapper')

// Main rendering
ReactDOM.createRoot(root).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
)
