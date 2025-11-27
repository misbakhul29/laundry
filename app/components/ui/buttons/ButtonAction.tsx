import { motion } from 'framer-motion';

const ButtonAction = ({
    children,
    onClick,
    className,
}: {
    children: React.ReactNode;
    onClick: () => void;
    className?: string;
}) => {
    return (
        <motion.button
            onClick={onClick}
            className={`${className} bg-linear-to-br from-yellow-400 to-yellow-600 text-amber-900 font-sans font-bold py-2 px-4 rounded-lg hover:from-yellow-300 hover:to-yellow-500 transition-colors duration-300`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
            {children}
        </motion.button>
    );
};

export default ButtonAction;