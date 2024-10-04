import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { genSalt, hash } from 'bcrypt';

const pfFlags = [
  { permission_flag_name: 'ADMIN', permission_flag_description: 'admin access' },
  { permission_flag_name: 'HR', permission_flag_description: 'hr access' },
  { permission_flag_name: 'EMP', permission_flag_description: 'emp access' },
];

const roles = [
    { role_name: "ADMIN", permissions: ["ADMIN"] },
    { role_name: "HR", permissions: ["HR"] },
    { role_name: "EMP", permissions: ["EMP"] }
  ];

async function main() {
  const company = await prisma.company.create({
    data: {
      company_name: 'Heliverse Demo Pvt Ltd',
      company_address: '123, Gurugram, Haryana',
      company_details: 'Web Solution Pvt Ltd',
      company_logo:
        'https://cdn.pixabay.com/photo/2017/03/16/21/18/logo-2150297_640.png',
      country: 'India',
      currency: 'INR',
      company_data_history: {
        create: {
          standarized_shift_hours: 8,
          ot_pay_type: 'PAY_IN_SALARY',
          payment_day_of_month: 30,
          salary_freq: 'Monthly',
          standard_monthly_days: 30,
          min_half_day_hours: 5,
        },
      },
    },
  });

  // Create permissions
  await prisma.permission_flag.createMany({
    data: pfFlags,
  });

  // Fetch all permissions to use their IDs
  const allPermissions = await prisma.permission_flag.findMany();

  // Create roles and link permissions
  for (const role of roles) {
    const createdRole = await prisma.role.create({
      data: {
        role_name: role.role_name,
        role_permission: {
          create: role.permissions.map(permission_name => {
            const permission = allPermissions.find(
              pf => pf.permission_flag_name === permission_name,
            );
            return { permission_flag_id: permission.permission_flag_id };
          }),
        },
      },
    });
  }

  const adminRole = await prisma.role.findFirst({where:{role_name:"ADMIN"}})

  const salt = await genSalt();
  const hashedPassword = await hash("admin", salt);

  const admin = await prisma.user.upsert({
    where: { user_email: 'admin@heliverse.com' },
    update:{},
    create:{
        user_name:"Admin",
        firstname:"Admin",
        user_email:"admin@heliverse.com",
        date_of_joining:new Date(),
        role_id:adminRole?.role_id,
        company_id:company?.company_id,
        user_password: hashedPassword,
        isApproved:true,
        status:"Active",
        payroll:{
            create:{}
        }
    }
  })


  const template = await prisma.companyTemplate.upsert({
    where:{template_id:"9185b96c-8b3e-4e42-a5fb-899ddf2b66ag"},
    update:{},
    create:{
      template_name:"Default Onboarding",
      template_content:'{"root":{"children":[{"children":[{"altText":"Keystone Security Logo","caption":{"editorState":{"root":{"children":[],"direction":null,"format":"","indent":0,"type":"root","version":1}}},"height":0,"maxWidth":"100%","showCaption":false,"src":"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTT1NI6mz4INc9s34oyiuO6nNUWacisSfQOSA&s","type":"image","version":1,"width":0}],"direction":null,"format":"start","indent":0,"type":"paragraph","version":1,"textFormat":0},{"children":[{"detail":0,"format":1,"mode":"normal","style":"","text":"Hi {{user_name}},","type":"text","version":1}],"direction":"ltr","format":"start","indent":0,"type":"paragraph","version":1,"textFormat":1},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Welcome to Keystone Security! We are thrilled to have you join us and look forward to working with you. Your first day is right around the corner, and we want to ensure you have everything you need to hit the ground running. Below is some important information to help you get started:","type":"text","version":1},{"type":"linebreak","version":1}],"direction":"ltr","format":"start","indent":0,"type":"paragraph","version":1,"textFormat":0},{"children":[{"detail":0,"format":1,"mode":"normal","style":"","text":"What you need to do next:","type":"text","version":1}],"direction":"ltr","format":"start","indent":0,"type":"paragraph","version":1,"textFormat":1},{"children":[{"children":[{"detail":0,"format":1,"mode":"normal","style":"","text":"Fill Out Your Details:","type":"text","version":1},{"detail":0,"format":0,"mode":"normal","style":"","text":" Please complete your profile and provide all necessary information on our HRMS platform.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"listitem","version":1,"value":1},{"children":[{"detail":0,"format":1,"mode":"normal","style":"","text":"Access Your Onboarding Activation Link:","type":"text","version":1},{"detail":0,"format":0,"mode":"normal","style":"","text":" Click on the button below to get started. Please note that this link will expire at {{expireTime}}.","type":"text","version":1},{"type":"linebreak","version":1}],"direction":"ltr","format":"","indent":0,"type":"listitem","version":1,"value":2}],"direction":"ltr","format":"","indent":0,"type":"list","version":1,"listType":"bullet","start":1,"tag":"ul"},{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Start Onboarding","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"link","version":1,"rel":null,"target":null,"title":null,"url":"{{link}}"},{"type":"linebreak","version":1}],"direction":"ltr","format":"start","indent":0,"type":"paragraph","version":1,"textFormat":1},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"If you have any questions or need assistance, dont hesitate to reach out to us.","type":"text","version":1}],"direction":"ltr","format":"start","indent":0,"type":"paragraph","version":1,"textFormat":0},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Once again, welcome to Keystone Security. We are excited to have you onboard!","type":"text","version":1},{"type":"linebreak","version":1},{"type":"linebreak","version":1},{"type":"linebreak","version":1},{"detail":0,"format":0,"mode":"normal","style":"","text":"Best regards,","type":"text","version":1}],"direction":"ltr","format":"start","indent":0,"type":"paragraph","version":1,"textFormat":0},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"The Keystone Security HR Team","type":"text","version":1},{"type":"linebreak","version":1},{"type":"linebreak","version":1}],"direction":"ltr","format":"start","indent":0,"type":"paragraph","version":1,"textFormat":0},{"children":[{"detail":0,"format":1,"mode":"normal","style":"","text":"© 2024 Keystone Security. All rights reserved.","type":"text","version":1}],"direction":"ltr","format":"center","indent":0,"type":"paragraph","version":1,"textFormat":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
      template_content_html:`<div style="padding:10px;"><p class="editor-paragraph" style="text-align: start;"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTT1NI6mz4INc9s34oyiuO6nNUWacisSfQOSA&amp;s" alt="Keystone Security Logo"></p><p class="editor-paragraph" dir="ltr" style="text-align: start;"><b><strong class="editor-text-bold" style="white-space: pre-wrap;">Hi {{user_name}},</strong></b></p><p class="editor-paragraph" dir="ltr" style="text-align: start;"><span style="white-space: pre-wrap;">Welcome to Keystone Security! We are thrilled to have you join us and look forward to working with you. Your first day is right around the corner, and we want to ensure you have everything you need to hit the ground running. Below is some important information to help you get started:</span><br></p><p class="editor-paragraph" dir="ltr" style="text-align: start;"><b><strong class="editor-text-bold" style="white-space: pre-wrap;">What you need to do next:</strong></b></p><ul class="editor-list-ul"><li value="1" class="editor-listitem"><b><strong class="editor-text-bold" style="white-space: pre-wrap;">Fill Out Your Details:</strong></b><span style="white-space: pre-wrap;"> Please complete your profile and provide all necessary information on our HRMS platform.</span></li><li value="2" class="editor-listitem"><b><strong class="editor-text-bold" style="white-space: pre-wrap;">Access Your Onboarding Activation Link:</strong></b><span style="white-space: pre-wrap;"> Click on the button below to get started. Please note that this link will expire at {{expireTime}}.</span><br></li></ul><p class="editor-paragraph" dir="ltr" style="text-align: start;"><a href="{{link}}" class="editor-link"><span style="white-space: pre-wrap;">Start Onboarding</span></a><br></p><p class="editor-paragraph" dir="ltr" style="text-align: start;"><span style="white-space: pre-wrap;">If you have any questions or need assistance, don't hesitate to reach out to us.</span></p><p class="editor-paragraph" dir="ltr" style="text-align: start;"><span style="white-space: pre-wrap;">Once again, welcome to Keystone Security. We are excited to have you onboard!</span><br><br><br><span style="white-space: pre-wrap;">Best regards,</span></p><p class="editor-paragraph" dir="ltr" style="text-align: start;"><span style="white-space: pre-wrap;">The Keystone Security HR Team</span><br><br></p><p class="editor-paragraph" dir="ltr" style="text-align: center;"><b><strong class="editor-text-bold" style="white-space: pre-wrap;">© 2024 Keystone Security. All rights reserved.</strong></b></p></div>`,
      variable_scopes:["USER"],
      predefined_variables:["user_name"],
      custom_variables:["expireTime","link"],
      template_description:"Welcoming Template"
    }
  })

  console.log("Company, Roles, Permissions And Admin created successfullty")
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async e => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
