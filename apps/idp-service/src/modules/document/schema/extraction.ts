import { Schema } from 'effect';

export const ReceiptDataSchema = Schema.Struct({
  merchant_name: Schema.NullOr(Schema.String),
  merchant_address: Schema.NullOr(Schema.String),
  // Transaction details
  receipt_number: Schema.NullOr(Schema.String),
  date: Schema.NullOr(Schema.String),
  time: Schema.NullOr(Schema.String),

  // Line items (simplified)
  items: Schema.NullOr(
    Schema.Array(
      Schema.Struct({
        name: Schema.NullOr(Schema.String),
        quantity: Schema.NullOr(Schema.Number),
        price: Schema.NullOr(Schema.Number),
        total: Schema.NullOr(Schema.Number),
      }),
    ),
  ),

  // Financial summary
  subtotal: Schema.NullOr(Schema.Number),
  tax: Schema.NullOr(Schema.Number),
  total: Schema.NullOr(Schema.Number),
  currency: Schema.NullOr(Schema.String),

  // Payment info
  payment_method: Schema.NullOr(Schema.String),
  amount_paid: Schema.NullOr(Schema.Number),
  change: Schema.NullOr(Schema.Number),
  markdown: Schema.String,
});

export const InvoiceDataSchema = Schema.Struct({
  // Invoice header information
  invoice_number: Schema.NullOr(Schema.String),
  invoice_date: Schema.NullOr(Schema.String),
  due_date: Schema.NullOr(Schema.String),
  issue_date: Schema.NullOr(Schema.String),

  // Seller/Provider information
  seller_name: Schema.NullOr(Schema.String),
  seller_address: Schema.NullOr(Schema.String),
  seller_phone: Schema.NullOr(Schema.String),
  seller_email: Schema.NullOr(Schema.String),
  seller_tax_id: Schema.NullOr(Schema.String),
  seller_company_id: Schema.NullOr(Schema.String),

  // Buyer/Customer information
  buyer_name: Schema.NullOr(Schema.String),
  buyer_address: Schema.NullOr(Schema.String),
  buyer_phone: Schema.NullOr(Schema.String),
  buyer_email: Schema.NullOr(Schema.String),
  buyer_tax_id: Schema.NullOr(Schema.String),
  buyer_company_id: Schema.NullOr(Schema.String),

  // Line items
  items: Schema.NullOr(
    Schema.Array(
      Schema.Struct({
        item_code: Schema.NullOr(Schema.String),
        description: Schema.NullOr(Schema.String),
        quantity: Schema.NullOr(Schema.Number),
        unit_price: Schema.NullOr(Schema.Number),
        discount: Schema.NullOr(Schema.Number),
        tax_rate: Schema.NullOr(Schema.Number),
        tax_amount: Schema.NullOr(Schema.Number),
        total: Schema.NullOr(Schema.Number),
      }),
    ),
  ),

  // Financial summary
  subtotal: Schema.NullOr(Schema.Number),
  discount_total: Schema.NullOr(Schema.Number),
  tax_total: Schema.NullOr(Schema.Number),
  shipping: Schema.NullOr(Schema.Number),
  other_fees: Schema.NullOr(Schema.Number),
  total_amount: Schema.NullOr(Schema.Number),
  currency: Schema.NullOr(Schema.String),

  // Payment terms and information
  payment_terms: Schema.NullOr(Schema.String),
  payment_method: Schema.NullOr(Schema.String),
  bank_account: Schema.NullOr(Schema.String),
  payment_status: Schema.NullOr(Schema.String),
  amount_paid: Schema.NullOr(Schema.Number),
  balance_due: Schema.NullOr(Schema.Number),

  // Additional information
  notes: Schema.NullOr(Schema.String),
  terms_and_conditions: Schema.NullOr(Schema.String),
  purchase_order_number: Schema.NullOr(Schema.String),
  project_reference: Schema.NullOr(Schema.String),
  markdown: Schema.String,
});

export const IndustryLicenseDataSchema = Schema.Struct({
  // License Information
  license_type: Schema.NullOr(Schema.String),
  license_number: Schema.NullOr(Schema.String),
  license_category: Schema.NullOr(Schema.String),
  license_class: Schema.NullOr(Schema.String),
  issue_date: Schema.NullOr(Schema.String),
  effective_date: Schema.NullOr(Schema.String),
  expiry_date: Schema.NullOr(Schema.String),
  validity_period: Schema.NullOr(Schema.String),
  license_status: Schema.NullOr(Schema.String),

  // Business/Licensee Information
  license_holder_name: Schema.NullOr(Schema.String),
  business_name: Schema.NullOr(Schema.String),
  business_registration_number: Schema.NullOr(Schema.String),
  business_type: Schema.NullOr(Schema.String),
  contact_number: Schema.NullOr(Schema.String),
  email_address: Schema.NullOr(Schema.String),
  website: Schema.NullOr(Schema.String),

  // Premises Information
  premises_address: Schema.NullOr(Schema.String),
  unit_stall_number: Schema.NullOr(Schema.String),
  floor_level: Schema.NullOr(Schema.String),
  building_complex_name: Schema.NullOr(Schema.String),
  postal_code: Schema.NullOr(Schema.String),
  gps_coordinates: Schema.NullOr(Schema.String),
  premises_type: Schema.NullOr(Schema.String),
  floor_area_size: Schema.NullOr(Schema.String),

  // Activity/Scope Information
  permitted_activities: Schema.NullOr(Schema.Array(Schema.String)),
  product_categories_allowed: Schema.NullOr(Schema.Array(Schema.String)),
  service_types_authorized: Schema.NullOr(Schema.Array(Schema.String)),
  operating_hours: Schema.NullOr(Schema.String),
  capacity_limits: Schema.NullOr(Schema.String),
  geographic_scope_territory: Schema.NullOr(Schema.String),

  // Owner/Operator Information
  owner_operator_name: Schema.NullOr(Schema.String),
  id_number: Schema.NullOr(Schema.String),
  nationality: Schema.NullOr(Schema.String),
  contact_address: Schema.NullOr(Schema.String),
  owner_contact_number: Schema.NullOr(Schema.String),
  owner_email_address: Schema.NullOr(Schema.String),

  // Regulatory Information
  issuing_authority: Schema.NullOr(Schema.String),
  department_division_name: Schema.NullOr(Schema.String),
  issuing_officer_name: Schema.NullOr(Schema.String),
  certificate_number: Schema.NullOr(Schema.String),
  reference_number: Schema.NullOr(Schema.String),
  application_number: Schema.NullOr(Schema.String),

  // Compliance Requirements
  required_inspections_schedule: Schema.NullOr(Schema.String),
  compliance_standards_referenced: Schema.NullOr(Schema.Array(Schema.String)),
  special_conditions_restrictions: Schema.NullOr(Schema.Array(Schema.String)),
  insurance_requirements: Schema.NullOr(Schema.String),
  bond_amount: Schema.NullOr(Schema.Number),
  health_safety_certifications_required: Schema.NullOr(
    Schema.Array(Schema.String),
  ),

  // Fee Information
  license_fee_amount: Schema.NullOr(Schema.Number),
  payment_date: Schema.NullOr(Schema.String),
  receipt_number: Schema.NullOr(Schema.String),
  renewal_fee: Schema.NullOr(Schema.Number),
  late_payment_penalty: Schema.NullOr(Schema.Number),
  currency: Schema.NullOr(Schema.String),

  // Additional Information
  qr_code_barcode: Schema.NullOr(Schema.String),
  previous_license_number: Schema.NullOr(Schema.String),
  authorized_signatures: Schema.NullOr(Schema.Array(Schema.String)),
  official_seal_stamp: Schema.NullOr(Schema.String),
  display_requirements: Schema.NullOr(Schema.String),

  // Validation Flags
  is_expired: Schema.NullOr(Schema.Boolean),
  is_renewable: Schema.NullOr(Schema.Boolean),
  requires_inspection: Schema.NullOr(Schema.Boolean),
  is_provisional: Schema.NullOr(Schema.Boolean),

  // Industry-Specific Fields
  food_categories: Schema.NullOr(Schema.Array(Schema.String)),
  kitchen_equipment_requirements: Schema.NullOr(Schema.Array(Schema.String)),
  hygiene_rating: Schema.NullOr(Schema.String),
  stall_location: Schema.NullOr(Schema.String),
  permitted_food_items: Schema.NullOr(Schema.Array(Schema.String)),
  operating_days: Schema.NullOr(Schema.Array(Schema.String)),
  permitted_destinations: Schema.NullOr(Schema.Array(Schema.String)),
  tour_types: Schema.NullOr(Schema.Array(Schema.String)),
  bonding_amount: Schema.NullOr(Schema.Number),
  insurance_coverage: Schema.NullOr(Schema.String),
  practitioner_qualifications: Schema.NullOr(Schema.Array(Schema.String)),
  services_authorized: Schema.NullOr(Schema.Array(Schema.String)),
  patient_capacity: Schema.NullOr(Schema.Number),
  alcohol_types_permitted: Schema.NullOr(Schema.Array(Schema.String)),
  serving_hours: Schema.NullOr(Schema.String),
  patron_capacity: Schema.NullOr(Schema.Number),

  // Suspension/Revocation Information
  suspension_date: Schema.NullOr(Schema.String),
  revocation_date: Schema.NullOr(Schema.String),
  suspension_reason: Schema.NullOr(Schema.String),
  revocation_reason: Schema.NullOr(Schema.String),

  // Transfer Information
  transfer_date: Schema.NullOr(Schema.String),
  previous_owner_details: Schema.NullOr(Schema.String),
  new_owner_details: Schema.NullOr(Schema.String),

  // Multi-Location Support
  multiple_premises: Schema.NullOr(
    Schema.Array(
      Schema.Struct({
        address: Schema.NullOr(Schema.String),
        permissions: Schema.NullOr(Schema.Array(Schema.String)),
        capacity: Schema.NullOr(Schema.String),
      }),
    ),
  ),
  markdown: Schema.String,
});

export const BusinessRegistrationDataSchema = Schema.Struct({
  // Business Information
  business_legal_name: Schema.NullOr(Schema.String),
  business_trading_name: Schema.NullOr(Schema.String),
  business_registration_number: Schema.NullOr(Schema.String),
  registration_type: Schema.NullOr(Schema.String),
  registration_date: Schema.NullOr(Schema.String),
  expiry_date: Schema.NullOr(Schema.String),
  renewal_date: Schema.NullOr(Schema.String),
  business_status: Schema.NullOr(Schema.String),

  // Registered Office Address
  registered_office_address: Schema.NullOr(
    Schema.Struct({
      street: Schema.NullOr(Schema.String),
      unit_suite: Schema.NullOr(Schema.String),
      city: Schema.NullOr(Schema.String),
      state_province: Schema.NullOr(Schema.String),
      postal_code: Schema.NullOr(Schema.String),
      country: Schema.NullOr(Schema.String),
    }),
  ),

  // Business Operating Address (if different)
  operating_address: Schema.NullOr(
    Schema.Struct({
      street: Schema.NullOr(Schema.String),
      unit_suite: Schema.NullOr(Schema.String),
      city: Schema.NullOr(Schema.String),
      state_province: Schema.NullOr(Schema.String),
      postal_code: Schema.NullOr(Schema.String),
      country: Schema.NullOr(Schema.String),
    }),
  ),

  // Business Details
  nature_of_business: Schema.NullOr(Schema.String),
  industry_classification_code: Schema.NullOr(Schema.String),
  business_category_type: Schema.NullOr(Schema.String),
  capital_amount: Schema.NullOr(Schema.Number),
  number_of_employees: Schema.NullOr(Schema.Number),

  // Owner/Proprietor Information (support for multiple owners)
  owners: Schema.NullOr(
    Schema.Array(
      Schema.Struct({
        full_name: Schema.NullOr(Schema.String),
        id_number: Schema.NullOr(Schema.String),
        nationality: Schema.NullOr(Schema.String),
        address: Schema.NullOr(Schema.String),
        contact_number: Schema.NullOr(Schema.String),
        email_address: Schema.NullOr(Schema.String),
      }),
    ),
  ),

  // Regulatory Information
  issuing_authority: Schema.NullOr(Schema.String),
  issuing_office_location: Schema.NullOr(Schema.String),
  certificate_number: Schema.NullOr(Schema.String),
  document_reference_number: Schema.NullOr(Schema.String),
  qr_code_barcode: Schema.NullOr(Schema.String),

  // Additional Information
  special_conditions_restrictions: Schema.NullOr(Schema.Array(Schema.String)),
  endorsements: Schema.NullOr(Schema.Array(Schema.String)),
  previous_registration_numbers: Schema.NullOr(Schema.Array(Schema.String)),
  official_stamps_seals_description: Schema.NullOr(Schema.String),
  signatures_present: Schema.NullOr(Schema.Array(Schema.String)),

  // Document Quality and Status
  is_valid: Schema.NullOr(Schema.Boolean),
  is_expired: Schema.NullOr(Schema.Boolean),
  is_certified_copy: Schema.NullOr(Schema.Boolean),
  is_original: Schema.NullOr(Schema.Boolean),
  contains_amendments: Schema.NullOr(Schema.Boolean),

  // Amendment Information (if applicable)
  amendment_details: Schema.NullOr(Schema.Array(Schema.String)),
  amendment_effective_dates: Schema.NullOr(Schema.Array(Schema.String)),

  // Multilingual Support
  primary_language: Schema.NullOr(Schema.String),
  other_languages: Schema.NullOr(Schema.Array(Schema.String)),

  // Temporary/Conditional Registration
  is_temporary: Schema.NullOr(Schema.Boolean),
  is_conditional: Schema.NullOr(Schema.Boolean),
  temporary_conditions: Schema.NullOr(Schema.Array(Schema.String)),
  conditional_requirements: Schema.NullOr(Schema.Array(Schema.String)),

  // Renewal Information
  is_renewal: Schema.NullOr(Schema.Boolean),
  original_registration_date: Schema.NullOr(Schema.String),
  renewal_history: Schema.NullOr(
    Schema.Array(
      Schema.Struct({
        renewal_date: Schema.NullOr(Schema.String),
        previous_number: Schema.NullOr(Schema.String),
        new_number: Schema.NullOr(Schema.String),
      }),
    ),
  ),
  markdown: Schema.String,
});

export const CertificateOfIncorporationDataSchema = Schema.Struct({
  // Company Information
  company_name: Schema.NullOr(Schema.String),
  company_registration_number: Schema.NullOr(Schema.String),
  incorporation_number: Schema.NullOr(Schema.String),
  date_of_incorporation: Schema.NullOr(Schema.String),
  certificate_issue_date: Schema.NullOr(Schema.String),
  company_type: Schema.NullOr(Schema.String),
  country_state_of_incorporation: Schema.NullOr(Schema.String),
  jurisdiction: Schema.NullOr(Schema.String),

  // Share Capital Information
  authorized_share_capital_amount: Schema.NullOr(Schema.Number),
  authorized_share_capital_currency: Schema.NullOr(Schema.String),
  number_of_shares_authorized: Schema.NullOr(Schema.Number),
  par_value_per_share: Schema.NullOr(Schema.Number),
  share_classes: Schema.NullOr(
    Schema.Array(
      Schema.Struct({
        class_name: Schema.NullOr(Schema.String),
        number_of_shares: Schema.NullOr(Schema.Number),
        par_value: Schema.NullOr(Schema.Number),
        rights: Schema.NullOr(Schema.String),
      }),
    ),
  ),

  // Registered Office
  registered_office_address: Schema.NullOr(
    Schema.Struct({
      street: Schema.NullOr(Schema.String),
      building: Schema.NullOr(Schema.String),
      city: Schema.NullOr(Schema.String),
      state_province: Schema.NullOr(Schema.String),
      postal_code: Schema.NullOr(Schema.String),
      country: Schema.NullOr(Schema.String),
    }),
  ),

  // Directors Information
  directors: Schema.NullOr(
    Schema.Array(
      Schema.Struct({
        name: Schema.NullOr(Schema.String),
        id_number: Schema.NullOr(Schema.String),
        nationality: Schema.NullOr(Schema.String),
        address: Schema.NullOr(Schema.String),
        appointment_date: Schema.NullOr(Schema.String),
      }),
    ),
  ),

  // Company Secretary
  company_secretary: Schema.NullOr(
    Schema.Struct({
      name: Schema.NullOr(Schema.String),
      id_number: Schema.NullOr(Schema.String),
      appointment_date: Schema.NullOr(Schema.String),
    }),
  ),

  // Shareholders/Members
  shareholders: Schema.NullOr(
    Schema.Array(
      Schema.Struct({
        name: Schema.NullOr(Schema.String),
        number_of_shares_held: Schema.NullOr(Schema.Number),
        share_class: Schema.NullOr(Schema.String),
        id_number: Schema.NullOr(Schema.String),
        nationality: Schema.NullOr(Schema.String),
      }),
    ),
  ),

  // Corporate Information
  company_objects_purpose: Schema.NullOr(Schema.String),
  financial_year_end_date: Schema.NullOr(Schema.String),
  memorandum_reference_number: Schema.NullOr(Schema.String),
  articles_reference_number: Schema.NullOr(Schema.String),

  // Regulatory Information
  issuing_authority: Schema.NullOr(Schema.String),
  registrar_of_companies: Schema.NullOr(Schema.String),
  certificate_number: Schema.NullOr(Schema.String),
  document_reference_number: Schema.NullOr(Schema.String),
  official_seal_stamp_description: Schema.NullOr(Schema.String),
  authorized_signatures: Schema.NullOr(Schema.Array(Schema.String)),
  qr_code_barcode: Schema.NullOr(Schema.String),

  // Additional Information
  special_resolutions: Schema.NullOr(Schema.Array(Schema.String)),
  restrictions_on_transfer_shares: Schema.NullOr(Schema.String),
  special_provisions_conditions: Schema.NullOr(Schema.Array(Schema.String)),
  parent_company: Schema.NullOr(Schema.String),

  // Document Authenticity
  is_certified_copy: Schema.NullOr(Schema.Boolean),
  has_restrictions: Schema.NullOr(Schema.Boolean),
  is_subsidiary: Schema.NullOr(Schema.Boolean),
  has_watermarks: Schema.NullOr(Schema.Boolean),
  has_security_features: Schema.NullOr(Schema.Boolean),
  is_digitally_signed: Schema.NullOr(Schema.Boolean),

  // Amendment Information (if applicable)
  amendment_details: Schema.NullOr(Schema.Array(Schema.String)),
  amendment_effective_dates: Schema.NullOr(Schema.Array(Schema.String)),
  changes_made: Schema.NullOr(Schema.Array(Schema.String)),

  // Foreign Company Information (if applicable)
  is_foreign_company: Schema.NullOr(Schema.Boolean),
  foreign_incorporation_details: Schema.NullOr(Schema.String),
  local_registration_number: Schema.NullOr(Schema.String),

  // Name Change Information (if applicable)
  previous_company_name: Schema.NullOr(Schema.String),
  name_change_effective_date: Schema.NullOr(Schema.String),

  // Digital Certificate Information (if applicable)
  certificate_authority: Schema.NullOr(Schema.String),
  digital_signature_details: Schema.NullOr(Schema.String),
  certificate_validity_period: Schema.NullOr(Schema.String),
  markdown: Schema.String,
});
