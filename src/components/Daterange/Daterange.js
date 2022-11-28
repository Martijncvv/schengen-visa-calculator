import React, { useEffect, useState } from 'react'

import './Daterange.css'

const Daterange = ({ index, startDate, endDate }) => {
	console.log('startDate: ', startDate)
	console.log('endDate: ', endDate)
	return (
		<div id="daterange-field" key={index}>
			{startDate} - {endDate}
		</div>
	)
}

export default Daterange
