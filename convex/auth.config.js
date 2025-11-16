export default {
    providers: [
        {
            //dev: https://awake-elf-68.clerk.accounts.dev
            //prod: https://clerk.citrusreach.com
            domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
            applicationID: "convex",
        }
    ]
}