import dotenv from "dotenv";
dotenv.config();
import connectDB from "../config/db.js";
import Permission from "../models/permissionModel.js";
import Page from "../models/pageModel.js";

// List of admin pages with their paths and available actions
const adminPages = [
  { pageName: "Users", path: "/admin/users", actions: ["read", "update", "delete", "export"] },
  { pageName: "Transactions", path: "/admin/transactions", actions: ["read", "update", "export"] },
  { pageName: "Approve Payment", path: "/admin/approve-payment", actions: ["read", "update", "approve"] },
  { pageName: "Withdraw", path: "/admin/withdraw", actions: ["read", "update", "export"] },
  { pageName: "Claims", path: "/admin/claims", actions: ["read", "update", "export"] },
  { pageName: "DreamPool", path: "/admin/dreampool", actions: ["read", "update", "export"] },
  { pageName: "Admins", path: "/admin/admin", actions: ["read", "update", "delete"] },
  { pageName: "Create Admin", path: "/admin/create-admin", actions: ["read", "update"] },
  { pageName: "Admin Detail", path: "/admin/admin/:id", actions: ["read", "update"] },
  { pageName: "Double KYC", path: "/admin/double-kyc", actions: ["read", "update"] },
  { pageName: "Permissions", path: "/admin/permissions", actions: ["read", "update"] },
  { pageName: "Permission Details", path: "/admin/permissions/:id", actions: ["read", "update"] },
  { pageName: "Create Permission", path: "/admin/permissions/create", actions: ["read", "update"] },
  { pageName: "News", path: "/admin/news", actions: ["read", "update", "delete"] },
  { pageName: "Create News", path: "/admin/news/create", actions: ["read", "update"] },
  { pageName: "Edit News", path: "/admin/news/:id/edit", actions: ["read", "update"] },
  { pageName: "Config", path: "/admin/config", actions: ["read", "update"] },
  { pageName: "User History", path: "/admin/user-history", actions: ["read", "update"] },
  { pageName: "Move System", path: "/admin/move-system", actions: ["read", "update"] },
  { pageName: "Move System List", path: "/admin/move-system-list", actions: ["read", "update"] },
  { pageName: "Swap", path: "/admin/swap", actions: ["read", "update"] },
  { pageName: "Dormant Users", path: "/admin/user/dormant", actions: ["read", "update", "export"] },
  { pageName: "Users Eligible Pre-Tier 2", path: "/admin/eligible-pre-tier-2", actions: ["read", "update"] },
  { pageName: "Users Pre-Tier 2", path: "/admin/pre-tier-2-users", actions: ["read", "update"] },
  { pageName: "Cronjob", path: "/admin/cronjob", actions: ["read", "update"] },
  { pageName: "Wallet Connect List", path: "/admin/wallet-connect-list", actions: ["read", "update"] },
  { pageName: "Link Verify", path: "/admin/linkVerify", actions: ["read", "update"] },
  { pageName: "System", path: "/admin/system", actions: ["read", "update"] },
  { pageName: "User Profile", path: "/admin/users/:id", actions: ["read", "update"] },
  { pageName: "Transaction Detail", path: "/admin/transactions/:id", actions: ["read", "update"] },
  { pageName: "Export Users", path: "/admin/export/users", actions: ["read", "export"] },
  { pageName: "Export Payments", path: "/admin/export/payments", actions: ["read", "export"] },
  { pageName: "Export Withdraw", path: "/admin/withdraw/export", actions: ["read", "export"] },
  { pageName: "Export Dreampool", path: "/admin/export/dreampool", actions: ["read", "export"] },
  { pageName: "Export Claims", path: "/admin/export/claims", actions: ["read", "export"] },
  { pageName: "Create User", path: "/admin/create-user", actions: ["read", "update"] },
];

const createAdminPermissions = async () => {
  try {
    await connectDB();

    console.log("Creating admin pages and permissions...");

    // Create or update pages
    const pageIds = [];
    for (const pageData of adminPages) {
      let page = await Page.findOne({ path: pageData.path });
      if (!page) {
        page = await Page.create({
          pageName: pageData.pageName,
          path: pageData.path,
          type: "admin",
          actions: pageData.actions,
        });
        console.log(`Created page: ${pageData.pageName} (${pageData.path})`);
      } else {
        // Update existing page
        page.pageName = pageData.pageName;
        page.actions = pageData.actions;
        page.type = "admin";
        await page.save();
        console.log(`Updated page: ${pageData.pageName} (${pageData.path})`);
      }
      pageIds.push(page._id);
    }

    // Create or update permission for admin role
    let permission = await Permission.findOne({ role: "admin" });
    if (permission) {
      // Update existing permission
      permission.pagePermissions = adminPages.map((pageData, index) => ({
        page: pageIds[index],
        actions: pageData.actions,
      }));
      await permission.save();
      console.log("Updated admin permissions");
    } else {
      // Create new permission
      permission = await Permission.create({
        role: "admin",
        pagePermissions: adminPages.map((pageData, index) => ({
          page: pageIds[index],
          actions: pageData.actions,
        })),
      });
      console.log("Created admin permissions");
    }

    console.log(`\nSuccessfully created/updated ${adminPages.length} pages and admin permissions!`);
    console.log("Admin role now has access to all admin pages with full permissions.");
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin permissions:", error);
    process.exit(1);
  }
};

createAdminPermissions();

