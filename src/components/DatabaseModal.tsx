import React, { useState } from 'react';
import {
  X,
  Database,
  Server,
  FileCode,
  RotateCcw,
  Check,
  Copy,
  Terminal,
  AlertCircle,
} from 'lucide-react';
import { DatabaseStatus } from '../types/index.ts';
import { api } from '../api.ts';

interface DatabaseModalProps {
  status: DatabaseStatus | null;
  onClose: () => void;
  onResetComplete: () => void;
}

export const DatabaseModal: React.FC<DatabaseModalProps> = ({
  status,
  onClose,
  onResetComplete,
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'schema' | 'seed' | 'setup'>('status');
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [copiedSeed, setCopiedSeed] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  const schemaSql = `-- SmartStock Academic - Relational Database Schema (MySQL)
CREATE DATABASE IF NOT EXISTS smartstock_db;
USE smartstock_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role ENUM('admin', 'cashier') NOT NULL DEFAULT 'cashier',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_users_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255) DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  sku VARCHAR(50) NOT NULL UNIQUE,
  barcode VARCHAR(50) NOT NULL UNIQUE,
  category_id INT NOT NULL,
  cost_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  selling_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  stock_quantity INT NOT NULL DEFAULT 0,
  min_stock_level INT NOT NULL DEFAULT 5,
  image_url VARCHAR(255) DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX idx_products_sku (sku),
  INDEX idx_products_barcode (barcode)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS sales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_no VARCHAR(30) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  customer_name VARCHAR(100) DEFAULT 'Walk-in Student',
  customer_phone VARCHAR(20) DEFAULT '',
  subtotal DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  tax DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_method ENUM('cash', 'card', 'upi') NOT NULL DEFAULT 'cash',
  amount_paid DECIMAL(10, 2) NOT NULL,
  change_returned DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  status ENUM('completed', 'refunded') NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS sale_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sale_id INT NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(150) NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (sale_id) REFERENCES sales(id) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

  const seedSql = `-- Default credentials:
-- admin / admin123
-- cashier / cashier123
USE smartstock_db;

INSERT INTO users (id, username, password_hash, full_name, role) VALUES
(1, 'admin', '$2a$10$wT0E8y91Qy08r1l9C5n0euLkJzDcf3uQ4oP.LpQe4P2hO9s9v2KGe', 'Dr. Alistair Vance (Admin)', 'admin'),
(2, 'cashier', '$2a$10$wT0E8y91Qy08r1l9C5n0euLkJzDcf3uQ4oP.LpQe4P2hO9s9v2KGe', 'Sarah Jenkins (Cashier)', 'cashier');

INSERT INTO categories (id, name, description) VALUES
(1, 'Textbooks & Guides', 'Core curriculum academic manuals'),
(2, 'Lab Hardware & Kits', 'Microcontrollers, multimeters, sensors'),
(3, 'Stationery & Drafting', 'Notebooks, technical drafting tools, pens'),
(4, 'Calculators & Tech', 'Scientific/graphing calculators'),
(5, 'Campus Merch & Safety', 'Lab goggles, coats, bags');`;

  const handleCopy = (text: string, type: 'schema' | 'seed') => {
    navigator.clipboard.writeText(text);
    if (type === 'schema') {
      setCopiedSchema(true);
      setTimeout(() => setCopiedSchema(false), 2000);
    } else {
      setCopiedSeed(true);
      setTimeout(() => setCopiedSeed(false), 2000);
    }
  };

  const handleResetData = async () => {
    if (!window.confirm('Are you sure you want to re-seed the sample database? All temporary sales and edits will be reset.')) {
      return;
    }

    try {
      setIsResetting(true);
      await api.resetDatabase();
      setResetMessage('Database re-seeded successfully with initial academic store catalogue.');
      onResetComplete();
      setTimeout(() => setResetMessage(''), 3000);
    } catch (err: any) {
      alert(`Reset failed: ${err.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">System Database &amp; Architecture</h3>
              <p className="text-xs text-slate-400">
                MySQL Relational Schema &amp; Dual-Engine Runtime
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('status')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'status'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Active Engine Status
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'schema'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            schema.sql (MySQL)
          </button>
          <button
            onClick={() => setActiveTab('seed')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'seed'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            seed.sql
          </button>
          <button
            onClick={() => setActiveTab('setup')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'setup'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            DevOps &amp; Local Setup
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {activeTab === 'status' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Relational Engine</span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    {status?.engine || 'Active'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Diagnostic Message</span>
                  <span className="text-xs text-slate-300 font-mono text-right max-w-xs truncate">
                    {status?.statusMessage}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-center">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-lg font-bold text-white">{status?.counts.products ?? 0}</div>
                    <div className="text-[10px] text-slate-400">Products</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-lg font-bold text-white">{status?.counts.categories ?? 0}</div>
                    <div className="text-[10px] text-slate-400">Categories</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-lg font-bold text-white">{status?.counts.sales ?? 0}</div>
                    <div className="text-[10px] text-slate-400">Sales</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-lg font-bold text-white">{status?.counts.users ?? 0}</div>
                    <div className="text-[10px] text-slate-400">Users</div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-850 border border-slate-800/80">
                <h4 className="text-xs font-semibold text-white mb-1 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-indigo-400" />
                  Dual-Mode Architecture Guarantee
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  This deployment is equipped with a fault-tolerant connection pool manager. When running in container sandboxes without a live MySQL daemon, it automatically runs an ACID-compliant persisted relational engine with full transactional stock decrements and invoice integrity. When run locally with a live MySQL service on port 3306, it effortlessly switches to standard MySQL InnoDB tables!
                </p>
              </div>

              {resetMessage && (
                <div className="p-3 rounded-lg bg-purple-950/40 border border-purple-800 text-purple-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  {resetMessage}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-400">
                  Need to restore the initial academic catalogue &amp; sales?
                </span>
                <button
                  onClick={handleResetData}
                  disabled={isResetting}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
                  Re-seed Database
                </button>
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Target MySQL 8.0+ schema with constraints &amp; indexes
                </span>
                <button
                  onClick={() => handleCopy(schemaSql, 'schema')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
                >
                  {copiedSchema ? <Check className="w-3.5 h-3.5 text-purple-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSchema ? 'Copied to Clipboard' : 'Copy SQL'}
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-purple-300 overflow-x-auto max-h-72">
                {schemaSql}
              </pre>
            </div>
          )}

          {activeTab === 'seed' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Initial users &amp; categories seed queries
                </span>
                <button
                  onClick={() => handleCopy(seedSql, 'seed')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
                >
                  {copiedSeed ? <Check className="w-3.5 h-3.5 text-purple-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSeed ? 'Copied to Clipboard' : 'Copy SQL'}
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-purple-300 overflow-x-auto max-h-72">
                {seedSql}
              </pre>
            </div>
          )}

          {activeTab === 'setup' && (
            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h5 className="font-semibold text-white flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-purple-400" />
                  Running on macOS (Apple Silicon / Intel with Homebrew)
                </h5>
                <pre className="p-2.5 rounded bg-slate-900 font-mono text-[11px] text-slate-300 overflow-x-auto">
                  brew install mysql{"\n"}
                  brew services start mysql{"\n"}
                  mysql -u root -e "CREATE DATABASE smartstock_db;"{"\n"}
                  mysql -u root smartstock_db &lt; database/schema.sql{"\n"}
                  mysql -u root smartstock_db &lt; database/seed.sql
                </pre>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h5 className="font-semibold text-white flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-purple-400" />
                  Running on Linux (Ubuntu / Debian)
                </h5>
                <pre className="p-2.5 rounded bg-slate-900 font-mono text-[11px] text-slate-300 overflow-x-auto">
                  sudo apt update &amp;&amp; sudo apt install -y mysql-server{"\n"}
                  sudo systemctl start mysql{"\n"}
                  mysql -u root -e "CREATE DATABASE smartstock_db;"{"\n"}
                  mysql -u root smartstock_db &lt; database/schema.sql
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900/60 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
