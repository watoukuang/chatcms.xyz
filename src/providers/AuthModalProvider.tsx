import React, {createContext, useContext, useState, useEffect} from 'react';
import AuthModal from '@/src/components/AuthModal';

interface AuthModalContextType {
    openLoginModal: () => void;
    openRegisterModal: () => void;
    closeModal: () => void;
    isOpen: boolean;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function useAuthModal() {
    const context = useContext(AuthModalContext);
    if (!context) {
        throw new Error('useAuthModal must be used within AuthModalProvider');
    }
    return context;
}

export function AuthModalProvider({children}: {children: React.ReactNode}) {
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<'login' | 'register'>('login');

    const openLoginModal = () => {
        setMode('login');
        setIsOpen(true);
    };

    const openRegisterModal = () => {
        setMode('register');
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
    };

    // 监听全局事件
    useEffect(() => {
        const handleOpenLogin = () => openLoginModal();
        const handleOpenRegister = () => openRegisterModal();

        window.addEventListener('openLoginModal', handleOpenLogin);
        window.addEventListener('openRegisterModal', handleOpenRegister);

        return () => {
            window.removeEventListener('openLoginModal', handleOpenLogin);
            window.removeEventListener('openRegisterModal', handleOpenRegister);
        };
    }, []);

    return (
        <AuthModalContext.Provider value={{openLoginModal, openRegisterModal, closeModal, isOpen}}>
            {children}
            <AuthModal isOpen={isOpen} onClose={closeModal} defaultMode={mode}/>
        </AuthModalContext.Provider>
    );
}
