// ==UserScript==
// @name        Blue AutoAds / AutoClaim
// @namespace   Violentmonkey Scripts
// @version     1.4
// @description Automatically watches ads and claims coins on start in Blue Farming bot
// @author      Ergamon
// @match       *://bluefarming.xyz/*
// @grant       none
// @icon        https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRySWsVzj4bozodJat-FKZC1L0lEIq-Q_NoCQ&s
// @downloadURL https://github.com/draftpin/blue/raw/main/blue-autoads.user.js
// @updateURL   https://github.com/draftpin/blue/raw/main/blue-autoads.user.js
// @homepage    https://github.com/draftpin/blue
// ==/UserScript==

(function blueAutoADS() {
	const waitMs = (ms) => new Promise((resolve) => setTimeout(() => resolve(true), ms))
	const getRandomInRange = (min, max) => max > min ? Math.floor(Math.random() * (max - min + 1)) + min : Math.floor(min)

	let claimDone = false

	function autoRestart() {
		location.reload()
	}

	function closeModal() {
		const blueBox = document.querySelector('[class^=_container_].white-box button.blue-box')
		if (blueBox) return blueBox.click()
	}

	function autoClaim() {
		if (closeModal()) return
		const claimButton = document.querySelector('[class^=_claimButton_]')

		console.log('Checking claim button... ', claimButton)
		if (!claimButton) return

		const claimPoints = parseInt(claimButton.innerText?.split(' [')[1].replace(/[^0-9]/g, ''), 10)
		if (claimPoints < 1000) {
			claimDone = true
			console.log('Already claimed: ', claimPoints)
			return 'OK'
		}
		console.log('Autoclaiming: ', claimPoints)
		setTimeout(() => claimDone = false, 60 * 60 * 1000)
		claimButton.click()
		return
	}

	function watchAds () {
		if (closeModal()) return
		if (location.pathname !== '/tasks') {
			const adsTasklink = document.querySelectorAll('[class^=_navBar_] ul li a')[1]
			return adsTasklink && adsTasklink.click()
		}
		const tab = document.querySelector('[class^=_tabBar_] > div')
		if (tab && !tab.className.includes('_activeTab')) return tab.click()
		const adsInProgress = document.querySelector('[class^=_banner]') || document.body.nextElementSibling?.shadowRoot === null
		if (adsInProgress) return
		const startButtonSelector = '[class^=_taskButton_]'
		const adsWatchingHero = Array.from(document.querySelectorAll('[class^=_row_]')).find(el => el.innerText.includes('Ads watching hero (500 ads done)\n[0'))
		if (adsWatchingHero) {
			const button = adsWatchingHero.querySelector(startButtonSelector)
			if (button) return button.click()
			return 'OK'
		}
		return document.querySelector(startButtonSelector).click()
	}
	async function autoAds () {
		while (autoClaim() !== 'OK') await waitMs(5000)
		while(watchAds() !== 'OK') await waitMs(1000)
		console.log(`Task completed`)
		const restartAfterHours = getRandomInRange(1, 4)
		setTimeout(autoRestart, restartAfterHours * 60 * 1000)
		console.log(`Autorestart after ${restartAfterHours} hours`)
	}
	autoAds()
})()