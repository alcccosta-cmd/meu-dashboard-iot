// create-user.js
const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // A senha em texto plano que será criptografada
  const plainTextPassword = '12345678';
  const password = await hash(plainTextPassword, 12);

  const user = await prisma.user.create({
    data: {
      email: 'alcc.costa@gmail.com',
      password, // Salva a senha já criptografada
    },
  });
  console.log('Usuário criado:', user);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });