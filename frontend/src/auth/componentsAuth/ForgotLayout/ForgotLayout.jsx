import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';

import { Field, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { NotificationToast, AlertMessage } from '@/components';

import { forgotSchema } from '@/auth/schemasAuth';
import { useAuth } from '@/context';

export const ForgotLayout = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data) => {
    try {
      await forgotPassword({ email: data.email });

      setToast({
        message:
          'Si el correo existe, te enviamos un enlace para restablecer tu contraseña',
        type: 'success',
      });

      setTimeout(() => setIsSuccess(true), 1200);
    } catch (err) {
      setToast({
        message: err.message || 'Error al intentar enviar el correo',
        type: 'error',
      });
    }
  };

  if (isSuccess) {
    return (
      <AlertMessage
        type='success'
        title='¡Revisa tu correo!'
        message='Si el correo existe, te enviamos un enlace para restablecer tu contraseña.'
        buttonText='Volver al inicio de sesión'
        onConfirm={() => navigate('/login')}
      />
    );
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut', staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <>
      <NotificationToast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: '' })}
      />

      <motion.div
        className='auth-container w-full max-w-[360px] rounded-[16px] p-5 shadow-xl border border-white/5 bg-white/80 dark:bg-black/40 backdrop-blur-xl'
        initial='hidden'
        animate='visible'
        variants={containerVariants}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldSet>
            <motion.div className='text-center mb-4' variants={itemVariants}>
              <h1 className='text-xl font-extrabold tracking-tight'>
                Recuperar Acceso
              </h1>
              <p className='text-muted-foreground text-[11px] mt-0.5 font-medium opacity-80'>
                Enviaremos un enlace a tu correo
              </p>
            </motion.div>

            <FieldGroup className='space-y-2'>
              <motion.div variants={itemVariants}>
                <Field>
                  <FieldLabel
                    htmlFor='email'
                    className='text-[11px] font-semibold mb-1 block opacity-90'
                  >
                    Correo electrónico
                  </FieldLabel>
                  <div className='relative group'>
                    <Mail className='absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground z-10 pointer-events-none' />
                    <Input
                      id='email'
                      type='email'
                      className={`auth-input pl-9 h-8.5 text-sm rounded-lg relative z-0 ${errors.email ? 'border-red-500 shadow-[0_0_0_2px_rgba(239,68,68,0.1)]' : ''}`}
                      placeholder='Ingresa tu correo'
                      {...register('email')}
                    />
                  </div>
                  <AnimatePresence mode='wait'>
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className='text-[10px] text-red-500 mt-1 ml-1 font-medium overflow-hidden'
                      >
                        {errors.email.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </Field>
              </motion.div>
            </FieldGroup>
          </FieldSet>

          <motion.div
            className='mt-5 flex flex-col gap-2'
            variants={itemVariants}
          >
            <Button
              type='submit'
              disabled={isSubmitting}
              className='auth-submit-btn w-full h-9.5 rounded-lg font-bold text-white uppercase tracking-wider text-[10px] cursor-pointer shadow-md'
            >
              {isSubmitting ? 'Enviando...' : 'Enviar enlace'}
            </Button>

            <Button
              variant='ghost'
              type='button'
              onClick={() => navigate('/login')}
              className='text-[10px] h-7 font-semibold text-muted-foreground hover:text-foreground transition-all flex items-center justify-center gap-2 group cursor-pointer'
            >
              <ArrowLeft
                size={12}
                className='group-hover:-translate-x-1 transition-transform'
              />
              Volver al Login
            </Button>
          </motion.div>
        </form>
      </motion.div>
    </>
  );
};
