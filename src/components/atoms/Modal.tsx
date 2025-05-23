import { useUIStore } from "../../stores/stores";
import { useTranslation } from "react-i18next";


interface ModalProps {
  children?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ children }) => {
  const { setModalOpen } = useUIStore();
  const { t } = useTranslation()
  return (
    <div className="fixed inset-0 backdrop-blur-md flex justify-center items-center z-50">
      <div className="bg-[#E1EEBC] p-4 rounded-lg shadow-lg max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl mx-2">
        {children}
        <button
          className="mt-2 px-4 py-2 bg-white text-black hover:bg-[#67AE6E] hover:text-white rounded-lg w-full cursor-pointer transition-colors duration-300"
          onClick={() => setModalOpen(false)}
        >
          {t('close')}
        </button>
      </div>
    </div>
  )
}

export default Modal