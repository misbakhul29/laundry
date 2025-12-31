import type { ElementType } from 'react'
import { motion } from 'framer-motion'
export const PageHeader = ({ title, description, icon }: { title: string, description: string, icon: ElementType }) => {
    const IconComponent = icon
    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="w-full flex items-center justify-start gap-2"
        >
            <span className='flex p-2 bg-linear-to-r from-indigo-500 to-indigo-400 rounded-lg'>
                <IconComponent className="w-6 h-6 text-white" />
            </span>
            <span className='flex flex-col justify-center items-start gap-2'>
                <h1 className="text-xl font-semibold text-center leading-4">{title}</h1>
                <span className="text-sm text-gray-300 leading-2">{description}</span>
            </span>
        </motion.div>
    )
}