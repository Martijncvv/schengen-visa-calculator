import React, { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import Calendar from 'rc-year-calendar'
import './Dashboard.css'

import Button from 'react-bootstrap/Button'

const Dashboard = () => {
	const [selectedDates, setSelectedDates] = useState([])

	useEffect(() => {
		const handleContextmenu = (e) => {
			e.preventDefault()
		}
		document.addEventListener('contextmenu', handleContextmenu)
		return function cleanup() {
			document.removeEventListener('contextmenu', handleContextmenu)
		}
	}, [])

	const handleRightClickDay = (rangeInfo) => {
		if (rangeInfo.events.length === 1) {
			setSelectedDates((selectedDates) => [
				...selectedDates.filter(
					(selection) => selection.id !== rangeInfo.events[0].id
				),
			])
		}
		if (rangeInfo.events.length > 1) {
			if (rangeInfo.events[0].id === 9999) {
				setSelectedDates((selectedDates) => [
					...selectedDates.filter(
						(selection) => selection.id !== rangeInfo.events[1].id
					),
				])
			} else {
				setSelectedDates((selectedDates) => [
					...selectedDates.filter(
						(selection) => selection.id !== rangeInfo.events[0].id
					),
				])
			}
		}
	}

	let mobileRangeStartDate = ''
	const handleMobileRangeClick = (rangeInfo) => {
		if (mobileRangeStartDate) {
			if (
				rangeInfo.startDate.getTime() < mobileRangeStartDate.startDate.getTime()
			) {
				console.log('NEW DATE < OLD DATE')
				return
			}

			let id = rangeInfo.calendar._dataSource
				? rangeInfo.calendar._dataSource.length
				: 0
			let startDate = new Date(
				mobileRangeStartDate.startDate.getTime() + 86400000
			)
			let endDate = new Date(rangeInfo.endDate)

			let newDateRange = {
				id,
				startDate,
				endDate,
				isControlDate: false,
			}

			setSelectedDates((selectedDates) => [...selectedDates, newDateRange])
			mobileRangeStartDate = ''
		} else {
			mobileRangeStartDate = rangeInfo

			let id = rangeInfo.calendar._dataSource
				? rangeInfo.calendar._dataSource.length
				: 0
			let startDate = new Date(mobileRangeStartDate.startDate)
			let endDate = new Date(rangeInfo.endDate)

			let newDateRange = {
				id,
				startDate,
				endDate,
				isControlDate: false,
			}

			setSelectedDates((selectedDates) => [...selectedDates, newDateRange])
		}
	}

	const handleRangeClick = (rangeInfo) => {
		let id = rangeInfo.calendar._dataSource
			? rangeInfo.calendar._dataSource.length
			: 0
		let startDate = new Date(rangeInfo.startDate)
		let endDate = new Date(rangeInfo.endDate)

		let newDateRange = {
			id,
			startDate,
			endDate,
			isControlDate: false,
		}

		setSelectedDates((selectedDates) => [...selectedDates, newDateRange])
	}
	const handleResetClick = () => {
		setSelectedDates([])
	}

	const handleSetControlDate = (dayInfo) => {
		let endDate = new Date(dayInfo)

		let controlTimeRange = {
			startTime: endDate.getTime() - 179 * 24 * 3600 * 1000,
			endTime: endDate.getTime(),
		}

		let newControlInfo = {
			id: 9999,
			startDate: new Date(controlTimeRange.startTime),
			endDate: new Date(controlTimeRange.endTime),
			isControlDate: true,
		}

		let controlDate = selectedDates.find((element) => element.id === 9999)
		if (controlDate) {
			setSelectedDates((selectedDates) =>
				selectedDates.map((dateInfo) =>
					dateInfo.id === 9999 ? newControlInfo : dateInfo
				)
			)
		} else {
			setSelectedDates((selectedDates) => [newControlInfo, ...selectedDates])
		}
	}

	const calcTotalStay = () => {
		if (!(selectedDates.length > 0)) {
			return 'No dates selected'
		}
		let controlDate = selectedDates.find((element) => element.id === 9999)
		if (!controlDate) {
			return 'Set control date'
		}
		let controlTime = controlDate.endDate.getTime()
		let startOfRollbackTime = controlTime - 180 * 24 * 3600 * 1000

		let stayInControlRange = 0

		selectedDates.forEach((dateRange) => {
			if (dateRange.id !== 9999) {
				let startTime = dateRange.startDate.getTime()
				let endTime = dateRange.endDate.getTime()
				let checkTime = startTime
				while (checkTime <= endTime) {
					if (checkTime >= startOfRollbackTime && checkTime <= controlTime) {
						stayInControlRange++
					}
					checkTime += 24 * 3600 * 1000
				}
			}
		})

		return `${stayInControlRange}`
	}
	const getLatestStayTime = () => {
		if (!(selectedDates.length > 0)) {
			return 0
		}

		let latestTime = 0
		selectedDates.forEach((dateRange) => {
			if (dateRange.id !== 9999) {
				let endTime = dateRange.endDate.getTime()
				if (endTime > latestTime) {
					latestTime = endTime
				}
			}
		})

		if (latestTime === 0) {
			return 0
		}
		return latestTime
	}

	const getNew90Days = () => {
		if (!(selectedDates.length > 0)) {
			return 'No dates selected'
		}

		let latestTime = getLatestStayTime()

		if (latestTime === 0) {
			return 'No dates selected'
		}

		let new90Days = latestTime + 91 * 24 * 3600 * 1000

		return `${new Date(new90Days).toLocaleDateString('en-GB')}`
	}

	const handleDayStyle = (element, date, events) => {
		let elementStyle = element.style
		elementStyle.borderRadius = 0
		elementStyle.borderBottom = `5px solid rgb(255, 245, 228)`

		if (events.length > 2) {
			console.log('overlapping dates')
			elementStyle.background = 'red'
			return
		}

		if (events.length > 1) {
			if (events[0].isControlDate) {
				// IN CONTROL RANGE
				elementStyle.background = 'rgb(73, 197, 196)'
				elementStyle.borderBottom = `5px solid black`
			} else {
				console.log('overlapping dates')
				elementStyle.background = 'red'
				return
			}
		}
		if (events[0].isControlDate) {
			if (events[0].endDate.getTime() === date.getTime() + 60 * 60 * 1000) {
				// CONTROL DATE
				// elementStyle.background = 'grey' //'#1A8FE3'
				elementStyle.borderBottom = `3px solid black`
				elementStyle.borderRight = `3px solid black`
			} else {
				// CONTROL RANGE
				elementStyle.borderBottom = `3px solid black`
			}
		} else {
			elementStyle.background = 'rgb(73, 197, 196)'
			elementStyle.background = 'rgb(255, 255, 255)'
			elementStyle.background = 'rgb(50, 97, 159)'
		}
	}
	// console.log('selectedDates: ', selectedDates)
	const calendarprop = {
		style: 'custom',
	}
	return (
		<div id="dashboard">
			<div id="calendar-field">
				<Calendar
					style={calendarprop.style}
					customDataSourceRenderer={handleDayStyle}
					roundRangeLimits={false}
					// allowOverlap={false}
					enableRangeSelection={true}
					dataSource={selectedDates}
					onDayContextMenu={(e) => handleRightClickDay(e)}
					onRangeSelected={(e) =>
						isMobile ? handleMobileRangeClick : handleRangeClick(e)
					}
				/>
				<div id="calendar-legenda-field" className="bottom-border-shadow">
					<h5>Legenda</h5>
					<p>
						<span style={{ color: 'rgb(50, 97, 159)' }}>&#9632; </span>Date
						outside control period
					</p>
					<p>
						<span style={{ color: 'rgb(73, 197, 196)' }}>&#9632; </span>Date in
						control period
					</p>
					<p>
						<span style={{ color: 'red' }}>&#9632; </span>Selected dates overlap
					</p>
					<p>
						<span style={{ color: 'black' }}>&#9866; </span>Control period
					</p>
				</div>
			</div>
			<div id="info-field">
				<h3>How to use</h3>
				<div id="interaction-field">
					<div id="controldate-input-field" className="bottom-border-shadow">
						<h4>Control Date</h4>
						<input
							id="control-date-picker"
							type="date"
							onChange={(e) => handleSetControlDate(e.target.value)}
						/>
						<Button
							onClick={handleResetClick}
							size="sm"
							variant="outline-secondary"
							id="reset-button"
						>
							Reset Calendar
						</Button>{' '}
					</div>
					<div id="top-explanation-field" className="bottom-border-shadow">
						<p>1. Set control date; entry/ exit date</p>
						<p>2. Select days stayed in Schengen on calendar</p>
						<p>3. Right-click to remove selection </p>
					</div>
				</div>
				<h4>Days stayed in control period </h4>
				<div className="counter-block bottom-border-shadow">
					{calcTotalStay()}
				</div>
				{parseInt(calcTotalStay()) >= 0 && (
					<>
						<h4>Days to stay left</h4>
						<div className="counter-block bottom-border-shadow">
							{90 - parseInt(calcTotalStay())}
						</div>

						<h4>Re-enter for new 90 days</h4>
						<div className="counter-block bottom-border-shadow">
							{getNew90Days()}
						</div>
					</>
				)}
				<div id="bottom-explanation-field" className="bottom-border-shadow">
					<h5>The 90/180 Day Rule Explained</h5>
					<p>
						- The 90 days you are allowed to spend in the Schengen zone are
						eligible for a 180-day period. This period is commonly referred to
						as a <b>“rolling timeframe”</b> because it’s constantly moving— each
						day you spend in Schengen advances your 180-day period. This period
						is counted backwards from your most recent entry/ exit dates;
						<b> control-period</b>.
					</p>

					<p>
						- An absence for an uninterrupted period of 90 days allows for a new
						stay for up to 90 days.
					</p>
					<p>
						Disclaimer: This calculator is a helping tool. The owner of this
						site disclaims all responsibility for anything. Remember to
						double-check these dates.
					</p>
					<p>
						More info on
						<a
							style={{ color: 'rgb(50, 97, 159)' }}
							rel="noreferrer"
							href="https://www.schengenvisainfo.com/"
						>
							SchengenVisaInfo
						</a>
					</p>
					<p>
						<a
							style={{ color: 'rgb(50, 97, 159)' }}
							rel="noreferrer"
							href="https://www.linkedin.com/in/martijnvanven/"
						>
							Contact
						</a>
					</p>
				</div>
			</div>
		</div>
	)
}

export default Dashboard
