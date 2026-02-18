
export async function checkContentInappropriate(text: string): Promise<{ isBad: boolean; reason?: string }> {
  // تم إيقاف التحقق بناءً على طلب المستخدم
  return {
    isBad: false
  };
}

/**
 * دالة التحقق من الاسم - تم تعديلها لتقبل أي إدخال
 */
export async function verifyArabicName(name: string): Promise<{ isValid: boolean; error?: string }> {
  return { 
    isValid: true 
  };
}
