import dbConnect from './dbConnect'

import {Service, ServiceCategory} from './models'

const getCatsAndServices = async (adminEmail) =>
{   
    await dbConnect()

    const categories = await ServiceCategory.find({adminEmail: adminEmail}).exec()

    const services = await Service.find({adminEmail: adminEmail})

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

export {
    getCatsAndServices
}