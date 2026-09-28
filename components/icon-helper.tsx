import React from 'react';
import { CaralIcon, Brand, Icons, CaralBrandName } from 'iconcaral2';

export interface DynamicIconProps {
  name?: string;
  size?: 's' | 'm' | 'l' | 'xl' | number;
  color?: string;
  className?: string;
  classname?: string;
}

const BRAND_NAMES: Record<string, CaralBrandName> = {
  aws: 'AWS',
  azuresql: 'AzureSql',
  googlestorage: 'GoogleStorage',
  sap: 'SAP',
  saleforce: 'Saleforce',
  salesforce: 'Saleforce',
  snowflake: 'Snowflake',
  redshift: 'Redshift',
  cloudera: 'Cloudera',
  teradata: 'Teradata',
  google: 'Google',
  databricks: 'Databricks',
  amazonredshift: 'AmazonRedshift',
  googlebigquery: 'GoogleBigquery',
  bigquery: 'GoogleBigquery',
  teams: 'Teams',
  deepseek: 'Deepseek',
  gemini: 'Gemini',
  openai: 'OpenAI',
  saphanac: 'SAPHanaC',
  saphana: 'SAPHanaC',
  s3: 'S3',
  harbinger: 'Harbinger',
  doxa: 'Doxa',
  daiana: 'Daiana',
  crestone: 'Crestone',
  creastone: 'Crestone',
  cloudcosting: 'CloudCosting',
  feelings: 'Feelings',
  ibmdb2: 'IBMDb2',
  db2: 'IBMDb2',
  mssql: 'MSSQL',
  mysql: 'mySQL',
  postgresql: 'PostgreSQL',
  postgres: 'PostgreSQL',
  onedrive: 'OneDrive',
  sharepoint: 'Sharepoint',
  pdf: 'PDF',
  doc: 'DOC',
  docx: 'DOCX',
  csv: 'CSV',
  xlsx: 'XLSX',
  excel: 'XLSX',
  json: 'Json',
  html: 'HTML',
  fabric: 'Fabric',
  sybase: 'Sybase',
  ollama: 'Ollama',
  windows: 'Windows',
  dataengineering: 'DataEngineering',
  onelake: 'OneLake',
  dataactivator: 'DataActivator',
  datafactory: 'DataFactory',
  synapse: 'Synapse',
  powerbi: 'PowerBI',
  database: 'Database',
  iq: 'IQ',
  dynamics: 'Dynamics',
  oracle: 'Oracle',
  azure: 'Azure',
  cloudstorage: 'CloudStorage',
};

const ICON_MAP: Record<string, Icons> = {
  book: 'book',
  'book-open': 'book',
  bookopen: 'book',
  bolt: 'bolt',
  lightning: 'bolt',
  zap: 'bolt',
  folder: 'folder',
  layers: 'cubeInCube',
  layer: 'cubeInCube',
  cubeincube: 'cubeInCube',
  sparkles: 'magic',
  star: 'magic',
  magic: 'magic',
  code: 'code',
  terminal: 'code',
  database: 'database',
  db: 'database',
  settings: 'gear',
  gear: 'gear',
  shield: 'shieldHalved',
  security: 'shieldHalved',
  'shield-alert': 'shieldHalved',
  help: 'circleInfo',
  'help-circle': 'circleInfo',
  info: 'circleInfo',
  'info-circle': 'circleInfo',
  file: 'file',
  'file-text': 'file',
  filetext: 'file',
  document: 'file',
  clock: 'clock',
  time: 'clock',
  calendar: 'calendar',
  home: 'house',
  house: 'house',
  search: 'search',
  chevronright: 'chevronRigth',
  'chevron-right': 'chevronRigth',
  chevrondown: 'chevronDown',
  'chevron-down': 'chevronDown',
  chevronleft: 'chevronLeft',
  'chevron-left': 'chevronLeft',
  chevronup: 'chevronUp',
  'chevron-up': 'chevronUp',
  arrowright: 'arrowRight',
  'arrow-right': 'arrowRight',
  arrowleft: 'arrowLeft',
  'arrow-left': 'arrowLeft',
  link: 'link',
  check: 'check',
  copy: 'copy',
  globe: 'globe',
  user: 'user',
  users: 'users',
  grid: 'grid',
};

export function DynamicIcon({
  name,
  size = 's',
  color = 'currentColor',
  className,
  classname,
}: DynamicIconProps) {
  const finalClass = classname || className;

  if (!name) {
    return <CaralIcon name="file" size={size} color={color} classname={finalClass} />;
  }

  const rawClean = name.replace(/^brand-/i, '').trim();
  const normalized = rawClean.toLowerCase();

  // 1. Check if it matches a Brand in Caral (e.g. Snowflake, SAP, AWS, etc.)
  if (name.toLowerCase().startsWith('brand-') || BRAND_NAMES[normalized]) {
    const brandName = BRAND_NAMES[normalized] || (rawClean as CaralBrandName);
    return (
      <div className={`inline-flex items-center justify-center shrink-0 ${finalClass || ''}`}>
        <Brand name={brandName} size={size} />
      </div>
    );
  }

  // 2. Check UI icons in CaralIcon
  const mappedIcon = ICON_MAP[normalized] || (rawClean as Icons);

  return (
    <CaralIcon
      name={mappedIcon}
      size={size}
      color={color}
      classname={finalClass}
    />
  );
}

