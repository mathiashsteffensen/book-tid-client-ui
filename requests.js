import dayjs from 'dayjs'
import axios from 'axios'

const API_URI = 'https://api.booktid.net/client'

const fetchClosedDatesWithinAllowedPeriod = (daysAhead, domainPrefix) =>
{
    return new Promise((resolve, reject) =>
    {
        const today = dayjs()
        const dateArray = [today]
        for (let i = 0; i < daysAhead; i++) dateArray.push(today.add(i, 'days'))
        
        axios.post(API_URI + `/closed-dates/${domainPrefix}`, {dateArray}).then((res) => resolve(res.data)).catch(err => reject(err.response.data.msg))
        
    })
}

const fetchAvailableTimes = (domainPrefix, serviceID, date) =>
{
    return new Promise ((resolve, reject) =>
    {
        axios.get(API_URI + `/available-times/${domainPrefix}/${serviceID}/${dayjs(date).add(12, 'hours').format('MM-DD-YYYY')}`)
            .then((res) => resolve(res.data))
            .catch(err => reject(err.response.data.msg))
    })
}

const bookAppointment = (domainPrefix, serviceID, calendarID, time, customer) =>
{
    return new Promise ((resolve, reject) =>
    {
        axios.post(API_URI + `/new-appointment/${domainPrefix}`, {
            service: serviceID,
            calendar: calendarID,
            time: time,
            customer: customer
        })
            .then(res => resolve(res.data))
            .catch(err => reject(err.response.data.msg))
    })
}

export {
    fetchClosedDatesWithinAllowedPeriod,
    fetchAvailableTimes,
    bookAppointment
}