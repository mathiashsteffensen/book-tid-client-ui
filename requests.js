import dayjs from 'dayjs'
import axios from 'axios'

const API_URI = process.env.NODE_ENV === 'production' ? 'https://api.booktid.net/client' : 'http://localhost:4000/client'

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

const getCatsAndServices = async (domainPrefix) =>
{   
    const res = await axios.get(API_URI + `/services-and-categories/${domainPrefix}`).then(res => res.data)

    console.log(res, domainPrefix)

    const {
        categories,
        services
    } = res

    if (categories.length === 0) return [
        {
            category: {
                name: 'Uden Kategori'
            },
            services: services
        }
    ]
    else 
    {
        let catsAndServices = categories.map((category) =>
        {
            return {
                category: category,
                services: services.filter((service) => service.categoryName === category.name)
            }
        })

        let usedServiceIDs = catsAndServices.map(catAndServices => catAndServices.services.map(service => service._id)).reduce((returnArray, currentArray) =>
        {
            return returnArray.concat(currentArray)
        })



        catsAndServices.push({
            category: {name: 'Uden Kategori'},
            services: services.filter((service) =>
            {
                return !usedServiceIDs.includes(service._id)
            })
        })

        return catsAndServices
    }
    
}

const getTheme = async (domainPrefix) =>
{
    return await axios.get(API_URI + '/theme/' +  domainPrefix).then((res) => res.data)
}

const getAppointmentByCancelToken = async (token, domainPrefix) => await axios.get(`${API_URI}/appointment/${token}/${domainPrefix}`).then((res) => res.data)

const cancelAppointment = async ( token, domainPrefix ) => await axios.patch(`${API_URI}/cancel-appointment/${token}/${domainPrefix}`).then((res) => res.data)

export {
    fetchClosedDatesWithinAllowedPeriod,
    fetchAvailableTimes,
    bookAppointment,
    getCatsAndServices,
    getTheme,
    getAppointmentByCancelToken,
    cancelAppointment
}