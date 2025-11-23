# Vercel Deployment Configuration

## Environment Variables Required

Before deploying to Vercel, you MUST set these environment variables in your Vercel project settings:

### How to Add Environment Variables in Vercel:

1. Go to your Vercel Dashboard: https://vercel.com/dashboard
2. Select your project: `bakery-management`
3. Go to **Settings** → **Environment Variables**
4. Add each of the following variables:

### Required Variables:

```
MONGODB_URI=mongodb+srv://4001shahi_db_user:64nqVDmbv5aUumeX@cluster0.gcgmqsf.mongodb.net/bireena_bakery?retryWrites=true&w=majority&appName=Cluster0

JWT_SECRET=c9da27d6792483ca8cba20ce2e6026a28d6944130974126679a82d72295595c57148037bec4c18679814b9ae9e51881bb054eaf2a8fc660b240189321861f279

SESSION_SECRET=17dcbd1d41e10d72c580be410ecd272348f0335451abdc2f0129920ee9d830dc17913106e52fb6113b71fda46de21ddb855c1458ab7c210f3e209025b580ab71

ADMIN_USERNAME=admin

ADMIN_PASSWORD=admin123

EMAIL_USER=roybabu1452@gmail.com

EMAIL_PASSWORD=ddkbkzuwuxohwaek

NODE_ENV=production

VERCEL=1
```

### Important Notes:

- **MONGODB_URI**: Make sure MongoDB Atlas allows connections from **0.0.0.0/0** (all IPs) in Network Access settings for Vercel's dynamic IPs
- All variables should be set for **Production**, **Preview**, and **Development** environments
- After adding variables, redeploy your project

### MongoDB Atlas Configuration:

1. Go to https://cloud.mongodb.com
2. Select your cluster
3. Click **Network Access** in the left sidebar
4. Click **Add IP Address**
5. Select **Allow Access from Anywhere** (0.0.0.0/0)
6. Click **Confirm**

### Disable Vercel Authentication (if enabled):

1. Go to **Settings** → **Deployment Protection**
2. Turn OFF **Vercel Authentication**
3. Save changes

### After Configuration:

1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Your app should now work correctly
