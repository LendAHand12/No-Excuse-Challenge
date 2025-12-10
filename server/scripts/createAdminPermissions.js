import dotenv from "dotenv";
dotenv.config();
import connectDB from "../config/db.js";
import Permission from "../models/permissionModel.js";
import Page from "../models/pageModel.js";

// Helper function to determine group based on path
const getGroupFromPath = (path) => {
  // Check export first (has priority)
  if (path.includes('/export') || path.includes('/transaction/export') || path.includes('/withdraw/export') || path.includes('/claims/export') || path.includes('/dreampool/export') || path === '/admin/user/export') {
    return 'export';
  }
  
  // Check specific paths
  if (path.includes('/users') || path.includes('/user/dormant') || path.includes('/user/tier2') || path.includes('/eligible-pre-tier') || path.includes('/pre-tier-2-users') || path.includes('/users-passed-tier') || path.includes('/users/create')) {
    return 'users';
  }
  if (path.includes('/transactions')) {
    return 'transactions';
  }
  if (path.includes('/news')) {
    return 'news';
  }
  if (path.includes('/system') || path.includes('/move-system') || path.includes('/user-history')) {
    return 'system';
  }
  if (path.includes('/permissions')) {
    return 'permissions';
  }
  if (path.includes('/claims')) {
    return 'claims';
  }
  if (path.includes('/withdraw') || path.includes('/approve-payment')) {
    return 'withdraw';
  }
  if (path.includes('/admin') || path.includes('/create-admin') || path.includes('/dashboard')) {
    return 'admin';
  }
  if (path.includes('/double-kyc') || path.includes('/linkVerify')) {
    return 'kyc';
  }
  if (path.includes('/tickets')) {
    return 'tickets';
  }
  // Default to 'other' for remaining pages (dreampool, wallets, cronjob, config, swap, pre-tier-2-pool)
  return 'other';
};

// List of admin pages with their paths and available actions
// Based on routes in App.tsx
const adminPages = [
  // Dashboard
  { pageName: "Dashboard", path: "/admin/dashboard", actions: ["read"] },
  
  // Users Management
  { pageName: "Users", path: "/admin/users", actions: ["read", "update", "delete", "export", "create"] },
  { pageName: "User Profile", path: "/admin/users/:id", actions: ["read", "update"] },
  { pageName: "Create User", path: "/admin/users/create", actions: ["read", "update"] },
  { pageName: "Export Users", path: "/admin/user/export", actions: ["read", "export"] },
  
  // Transactions
  { pageName: "Transactions", path: "/admin/transactions", actions: ["read", "update", "export"] },
  { pageName: "Transaction Detail", path: "/admin/transactions/:id", actions: ["read", "update"] },
  { pageName: "Export Transactions", path: "/admin/transaction/export", actions: ["read", "export"] },
  
  // Payment & Withdraw
  { pageName: "Approve Payment", path: "/admin/approve-payment", actions: ["read", "update", "approve"] },
  { pageName: "Withdraw", path: "/admin/withdraw", actions: ["read", "update", "export"] },
  { pageName: "Export Withdraw", path: "/admin/withdraw/export", actions: ["read", "export"] },
  
  // Claims
  { pageName: "Claims", path: "/admin/claims", actions: ["read", "update", "export"] },
  { pageName: "Export Claims", path: "/admin/claims/export", actions: ["read", "export"] },
  
  // DreamPool
  { pageName: "DreamPool", path: "/admin/dreampool", actions: ["read", "update", "export"] },
  { pageName: "Export Dreampool", path: "/admin/dreampool/export", actions: ["read", "export"] },
  
  // Admin Management
  { pageName: "Admins", path: "/admin/admin", actions: ["read", "update", "delete"] },
  { pageName: "Create Admin", path: "/admin/create-admin", actions: ["read", "update"] },
  { pageName: "Admin Detail", path: "/admin/admin/:id", actions: ["read", "update"] },
  
  // Permissions
  { pageName: "Permissions", path: "/admin/permissions", actions: ["read", "update"] },
  { pageName: "Permission Details", path: "/admin/permissions/:id", actions: ["read", "update"] },
  { pageName: "Create Permission", path: "/admin/permissions/create", actions: ["read", "update"] },
  
  // News
  { pageName: "News", path: "/admin/news", actions: ["read", "update", "delete"] },
  { pageName: "Create News", path: "/admin/news/create", actions: ["read", "update"] },
  { pageName: "Edit News", path: "/admin/news/edit", actions: ["read", "update"] },
  
  // Tickets
  { pageName: "Tickets", path: "/admin/tickets", actions: ["read", "update"] },
  { pageName: "Ticket Detail", path: "/admin/tickets/:id", actions: ["read", "update"] },
  
  // System & Config
  { pageName: "System", path: "/admin/system/:id", actions: ["read", "update"] },
  { pageName: "Config", path: "/admin/config", actions: ["read", "update"] },
  { pageName: "User History", path: "/admin/user-history", actions: ["read", "update"] },
  
  // Move System
  { pageName: "Move System", path: "/admin/move-system/:id", actions: ["read", "update"] },
  { pageName: "Move System List", path: "/admin/move-system-list", actions: ["read", "update"] },
  
  // Swap
  { pageName: "Swap", path: "/admin/swap", actions: ["read", "update"] },
  
  // User Management - Special
  { pageName: "Dormant Users", path: "/admin/user/dormant", actions: ["read", "update", "export"] },
  { pageName: "Users Tier 2", path: "/admin/user/tier2", actions: ["read", "update"] },
  { pageName: "Users Eligible Pre-Tier 2", path: "/admin/eligible-pre-tier-2", actions: ["read", "update"] },
  { pageName: "Users Pre-Tier 2", path: "/admin/pre-tier-2-users", actions: ["read", "update"] },
  { pageName: "Users Passed Tier 2", path: "/admin/users-passed-tier-2", actions: ["read", "update"] },
  { pageName: "Pre-Tier 2 Pool", path: "/admin/pre-tier-2-pool", actions: ["read", "update"] },
  
  // Wallets
  { pageName: "Setting Wallets", path: "/admin/wallets", actions: ["read", "update"] },
  { pageName: "Wallet Connect List", path: "/admin/wallet-connect-list", actions: ["read", "update"] },
  
  // Other
  { pageName: "Cronjob", path: "/admin/cronjob", actions: ["read", "update"] },
  { pageName: "Double KYC", path: "/admin/double-kyc", actions: ["read", "update"] },
  { pageName: "Link Verify", path: "/admin/linkVerify", actions: ["read", "update"] },
];

const createAdminPermissions = async () => {
  try {
    await connectDB();

    console.log("Creating admin pages and permissions...");

    // Create or update pages
    const pageIds = [];
    for (const pageData of adminPages) {
      // Determine group for this page
      const group = getGroupFromPath(pageData.path);
      
      let page = await Page.findOne({ path: pageData.path });
      if (!page) {
        page = await Page.create({
          pageName: pageData.pageName,
          path: pageData.path,
          type: "admin",
          actions: pageData.actions,
          group: group,
        });
        console.log(`Created page: ${pageData.pageName} (${pageData.path}) - Group: ${group}`);
      } else {
        // Update existing page
        page.pageName = pageData.pageName;
        page.actions = pageData.actions;
        page.type = "admin";
        page.group = group;
        await page.save();
        console.log(`Updated page: ${pageData.pageName} (${pageData.path}) - Group: ${group}`);
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

