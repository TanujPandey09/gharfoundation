"use client";

import React from "react";
import Icon from "@/components/shared/Icon";
import styles from "./Billing.module.css";

export default function BillingPage() {
  return (
    <>
      <section className={styles.pageWrapper}>
        <h1 className={styles.title}>Billing &amp; Payments</h1>
        <p className={styles.description}>
          Review your invoices, manage subscription plans and keep your payments secure.
        </p>
        <div className={styles.grid}>
          {/* Invoice Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <Icon name="receipt" size={24} className="text-white" />
              <h2 className={styles.cardTitle}>Recent Invoice</h2>
            </div>
            <p className={styles.cardInfo}>#INV-2024-07-07</p>
            <p className={styles.cardAmount}>₹12,500</p>
            <button className={styles.button}>View Details</button>
          </div>
          {/* Payment Method Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <Icon name="payment" size={24} className="text-white" />
              <h2 className={styles.cardTitle}>Payment Method</h2>
            </div>
            <p className={styles.cardInfo}>Visa •••• 4242</p>
            <button className={styles.button}>Manage Cards</button>
          </div>
        </div>
        {/* Decorative shredded privacy PNG */}
        <div className={styles.shredImage}>
          <img src="/privacy_shred.png" alt="Shredded Privacy Document" className={styles.shredImage} />
        </div>
      </section>
    </>
  );
}
