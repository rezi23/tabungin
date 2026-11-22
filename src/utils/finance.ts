import type {
  CashflowCase,
  ExpenseItem,
  FinanceMode,
  FinancialAnalysis,
  HealthLevel,
  LargestExpenseInfo,
  ModeFinancialData,
  ProjectionPoint,
  SmartDiagnostic,
} from '../types/finance';

const ID_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

const ID_MONTHS_FULL = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export function sanitizeAmount(value: number): number {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }
  return Math.round(value);
}

export function parseRupiahInput(raw: string): number {
  const digitsOnly = raw.replace(/\D/g, '');
  if (!digitsOnly) {
    return 0;
  }
  const parsed = Number(digitsOnly);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }
  return Math.min(parsed, 999_999_999_999_999);
}

export function formatDots(amount: number): string {
  const safe = Number.isFinite(amount) ? Math.round(Math.abs(amount)) : 0;
  return safe.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function formatRupiah(amount: number, options?: { showSign?: boolean }): string {
  const safe = Number.isFinite(amount) ? Math.round(amount) : 0;
  const absFormatted = `Rp ${formatDots(safe)}`;
  if (safe < 0) {
    return `-${absFormatted}`;
  }
  if (options?.showSign && safe > 0) {
    return `+${absFormatted}`;
  }
  return absFormatted;
}

export function formatRupiahCompact(amount: number): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  const sign = safe < 0 ? '-' : '';
  const abs = Math.abs(safe);

  if (abs >= 1_000_000_000_000) {
    return `${sign}Rp ${(abs / 1_000_000_000_000).toFixed(1).replace('.', ',')} T`;
  }
  if (abs >= 1_000_000_000) {
    return `${sign}Rp ${(abs / 1_000_000_000).toFixed(1).replace('.', ',')} M`;
  }
  if (abs >= 1_000_000) {
    const val = abs / 1_000_000;
    const formatted = Number.isInteger(val) ? val.toString() : val.toFixed(1).replace('.', ',');
    return `${sign}Rp ${formatted} jt`;
  }
  if (abs >= 1_000) {
    return `${sign}Rp ${Math.round(abs / 1_000)} rb`;
  }
  return `${sign}Rp ${Math.round(abs)}`;
}

export function formatPercent(value: number, decimals = 1): string {
  if (!Number.isFinite(value)) {
    return '0%';
  }
  const rounded = Number(value.toFixed(decimals));
  if (Number.isInteger(rounded)) {
    return `${rounded}%`;
  }
  return `${rounded.toFixed(decimals).replace('.', ',')}%`;
}

export function formatMonthsAndDays(monthsFloat: number): string {
  if (!Number.isFinite(monthsFloat) || monthsFloat <= 0) {
    return '0 Hari';
  }
  const totalDays = Math.round(monthsFloat * 30);
  if (totalDays <= 0) {
    return '0 Hari';
  }
  const months = Math.floor(totalDays / 30);
  const days = totalDays % 30;

  if (months === 0) {
    return `${days} Hari`;
  }
  if (days === 0) {
    return `${months} Bulan`;
  }
  return `${months} Bulan ${days} Hari`;
}

function getFutureCalendarDate(monthsAhead: number, referenceDate: Date): string {
  const target = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  const wholeMonths = Math.floor(monthsAhead);
  const extraDays = Math.round((monthsAhead - wholeMonths) * 30);
  target.setMonth(target.getMonth() + wholeMonths);
  target.setDate(target.getDate() + extraDays);
  return `${ID_MONTHS_FULL[target.getMonth()]} ${target.getFullYear()}`;
}

export function buildProjection(
  cash: number,
  netCashflow: number,
  referenceDate: Date = new Date()
): { projection: ProjectionPoint[]; zeroCrossMonth: number | null } {
  const projection: ProjectionPoint[] = [];
  const startMonth = referenceDate.getMonth();
  const startYear = referenceDate.getFullYear();

  for (let i = 0; i <= 12; i++) {
    const d = new Date(startYear, startMonth + i, 1);
    const cumulativeChange = netCashflow * i;
    const balance = cash + cumulativeChange;
    projection.push({
      monthIndex: i,
      monthLabel: i === 0 ? 'Saat Ini' : `Bln ${i}`,
      calendarLabel: `${ID_MONTHS[d.getMonth()]} ${d.getFullYear()}`,
      balance,
      cumulativeChange,
    });
  }

  let zeroCrossMonth: number | null = null;
  if (netCashflow < 0) {
    if (cash <= 0) {
      zeroCrossMonth = 0;
    } else {
      const exactMonth = cash / Math.abs(netCashflow);
      if (exactMonth <= 12) {
        zeroCrossMonth = exactMonth;
      }
    }
  }

  return { projection, zeroCrossMonth };
}

function buildSmartDiagnostic(params: {
  mode: FinanceMode;
  cash: number;
  income: number;
  totalExpenses: number;
  netCashflow: number;
  expenseRatio: number | null;
  maxHealthyRatio: number;
  cashflowCase: CashflowCase;
  burnRate: number;
  deficitRunwayMonths: number | null;
  deficitRunwayLabel: string;
  emergencyRunwayMonths: number | null;
  emergencyRunwayLabel: string;
  targetEmergencyFund: number;
  emergencyFundGap: number;
  monthsToSafeReserve: number | null;
  healthLevel: HealthLevel;
  largestExpense: LargestExpenseInfo | null;
  referenceDate: Date;
}): SmartDiagnostic {
  const {
    mode,
    cash,
    income,
    totalExpenses,
    netCashflow,
    expenseRatio,
    maxHealthyRatio,
    cashflowCase,
    burnRate,
    deficitRunwayMonths,
    deficitRunwayLabel,
    emergencyRunwayMonths,
    emergencyRunwayLabel,
    targetEmergencyFund,
    emergencyFundGap,
    monthsToSafeReserve,
    healthLevel,
    largestExpense,
    referenceDate,
  } = params;

  const isCompany = mode === 'company';
  const subject = isCompany ? 'perusahaan Anda' : 'Anda';
  const reserveTerm = isCompany ? 'cadangan kas operasional' : 'dana darurat';
  const incomeTerm = isCompany ? 'omzet bulanan' : 'pendapatan bulanan';
  const expenseTerm = isCompany ? 'pengeluaran operasional' : 'pengeluaran bulanan';

  if (cashflowCase === 'no_expenses') {
    return {
      headline: 'Tambahkan rincian pengeluaran untuk memulai analisis',
      reasonSummary: `Belum ada ${expenseTerm} yang tercatat saat ini. Masukkan minimal satu pos pengeluaran dengan nominal lebih dari Rp 0 agar Tabungin dapat mengevaluasi rasio biaya, ketahanan ${reserveTerm}, dan proyeksi kas ${subject}.`,
      largestExpenseNote: 'Belum ada pos pengeluaran dengan nominal aktif untuk dianalisis.',
      impactSimulation:
        income > 0
          ? `Dengan ${incomeTerm} sebesar ${formatRupiah(income)} dan belum ada biaya tercatat, kas Anda saat ini sebesar ${formatRupiah(cash)} akan bertambah menjadi ${formatRupiah(cash + income * 12)} dalam 12 bulan.`
          : `Saldo kas tercatat sebesar ${formatRupiah(cash)}. Lengkapi ${incomeTerm} dan daftar ${expenseTerm} untuk melihat simulasi arus kas 12 bulan.`,
      recommendations: isCompany
        ? [
            'Catat seluruh biaya tetap bulanan terlebih dahulu seperti Gaji Karyawan, Sewa Tempat, dan Operasional & Listrik.',
            'Masukkan rata-rata omzet bulanan bersih agar margin operasional dan runway kas terukur akurat.',
            'Gunakan tombol "Isi Contoh Data" bila ingin melihat simulasi kesehatan keuangan bisnis secara instan.',
          ]
        : [
            'Mulai dengan mencatat pengeluaran rutin terbesar seperti Kos/Kontrakan, Makan & Minum, dan Tagihan bulanan.',
            'Pastikan total saldo rekening dan pendapatan bulanan sudah diisi agar target dana darurat 6 bulan langsung terhitung.',
            'Gunakan tombol kategori cepat di sebelah kiri untuk mempercepat pencatatan di HP maupun desktop.',
          ],
    };
  }

  const largestExpenseNote = largestExpense
    ? `Pos pengeluaran terbesar ${subject} saat ini adalah ${largestExpense.name} sebesar ${formatRupiah(largestExpense.amount)} (${formatPercent(largestExpense.percentage)} dari total ${expenseTerm}).`
    : 'Seluruh pos pengeluaran masih bernilai Rp 0.';

  let headline = '';
  let reasonSummary = '';
  let impactSimulation = '';
  const recommendations: string[] = [];

  if (healthLevel === 'critical') {
    if (cash === 0) {
      headline = `Kondisi Kritis: Kas kosong di tengah beban ${formatRupiah(totalExpenses)}/bulan`;
      reasonSummary = `Status keuangan ${subject} berada pada level Tidak Sehat / Kritis karena saldo kas saat ini Rp 0 sementara masih terdapat beban ${expenseTerm} sebesar ${formatRupiah(totalExpenses)} per bulan${netCashflow < 0 ? ` dengan defisit ${formatRupiah(burnRate)} setiap bulan` : ''}. Tanpa cadangan kas, gangguan pemasukan sekecil apa pun langsung menghambat kewajiban rutin.`;
    } else {
      headline = `Kondisi Kritis: Defisit ${formatRupiah(burnRate)}/bulan, kas bertahan ${deficitRunwayLabel}`;
      reasonSummary = `Status keuangan ${subject} dinyatakan Tidak Sehat / Kritis karena arus kas sedang defisit (${expenseRatio !== null ? `rasio pengeluaran ${formatPercent(expenseRatio)}` : 'tanpa pemasukan'}) dan saldo kas saat ini (${formatRupiah(cash)}) hanya sanggup menutup defisit selama ${deficitRunwayLabel}, di bawah ambang aman 6 bulan.`;
    }

    if (cashflowCase === 'deficit') {
      const zeroDateStr =
        deficitRunwayMonths !== null
          ? getFutureCalendarDate(deficitRunwayMonths, referenceDate)
          : 'saat ini juga';
      impactSimulation =
        cash === 0
          ? `Kas sudah berada di titik Rp 0 dengan kekurangan arus kas ${formatRupiah(burnRate)} setiap bulan. Setiap bulan yang berjalan tanpa tambahan dana akan memicu akumulasi utang baru sebesar ${formatRupiah(burnRate)}.`
          : `Dengan laju penggerusan dana (burn rate) sebesar ${formatRupiah(burnRate)} per bulan, kas ${subject} sebesar ${formatRupiah(cash)} diperkirakan menyentuh Rp 0 dalam ${deficitRunwayLabel} (sekitar ${zeroDateStr}) jika tidak ada perubahan pada pemasukan atau pengeluaran.`;
    } else {
      impactSimulation = `Walaupun arus kas bulanan tidak defisit (${netCashflow > 0 ? `surplus ${formatRupiah(netCashflow)}/bulan` : 'impas Rp 0/bulan'}), saldo kas masih Rp 0. ${
        netCashflow > 0 && monthsToSafeReserve !== null
          ? `Jika seluruh surplus bulanan ditabung konsisten, butuh sekitar ${monthsToSafeReserve} bulan untuk membangun ${reserveTerm} ideal 6 bulan sebesar ${formatRupiah(targetEmergencyFund)}.`
          : `Karena belum ada sisa surplus bulanan, saldo kas akan tetap Rp 0 sepanjang 12 bulan ke depan.`
      }`;
    }

    if (isCompany) {
      if (largestExpense) {
        const trimTarget = Math.min(burnRate > 0 ? burnRate : Math.round(totalExpenses * 0.15), largestExpense.amount);
        recommendations.push(
          `Audit segera pos terbesar (${largestExpense.name}, ${formatPercent(largestExpense.percentage)} biaya): renegosiasi kontrak, efisiensi kapasitas, atau pemangkasan minimal ${formatRupiah(trimTarget)}/bulan agar laju burn rate melambat.`
        );
      }
      recommendations.push(
        cashflowCase === 'deficit'
          ? `Kejar percepatan penagihan piutang dan kampanye konversi cepat untuk menaikkan omzet minimal ${formatRupiah(burnRate)}/bulan agar operasional kembali impas.`
          : `Sisihkan minimal 15% dari omzet bulanan (${formatRupiah(Math.round(income * 0.15))}) secara otomatis ke rekening cadangan perusahaan untuk membentuk buffer awal.`
      );
      recommendations.push(
        `Tunda belanja modal (capex) atau ekspansi non-esensial hingga ketahanan kas operasional melewati batas aman minimal 6 bulan (${formatRupiah(targetEmergencyFund)}).`
      );
    } else {
      if (largestExpense) {
        const trimTarget =
          burnRate > 0 ? Math.min(burnRate, Math.round(largestExpense.amount * 0.35)) : Math.round(largestExpense.amount * 0.2);
        recommendations.push(
          `Tekan pos pengeluaran terbesar (${largestExpense.name}, ${formatPercent(largestExpense.percentage)} pengeluaran) setidaknya ${formatRupiah(Math.max(trimTarget, 100_000))}/bulan dengan menetapkan batas mingguan ketat.`
        );
      }
      recommendations.push(
        cashflowCase === 'deficit'
          ? `Tutup celah defisit ${formatRupiah(burnRate)}/bulan melalui kombinasi pemangkasan biaya gaya hidup non-primer dan pencarian sumber penghasilan tambahan segera.`
          : `Bangun dana darurat tahap awal sebesar 1 bulan pengeluaran (${formatRupiah(totalExpenses)}) terlebih dahulu sebelum menambah komitmen cicilan baru.`
      );
      recommendations.push(
        `Hindari penggunaan paylater atau utang konsumtif untuk menutup biaya rutin agar beban bulan berikutnya tidak makin membesar.`
      );
    }
  } else if (healthLevel === 'warning') {
    if (cashflowCase === 'deficit') {
      headline = `Perlu Perhatian: Arus kas defisit ${formatRupiah(burnRate)}/bulan meski kas masih cukup`;
      reasonSummary = `Status keuangan ${subject} berada pada level Waspada karena pengeluaran melampaui pemasukan (${expenseRatio !== null ? `rasio ${formatPercent(expenseRatio)}` : 'tanpa pemasukan'}). Meskipun kas saat ini (${formatRupiah(cash)}) masih sanggup menutup defisit selama ${deficitRunwayLabel} (≥ 6 bulan), tren penggerusan kas ini tidak berkelanjutan dalam jangka panjang.`;
      const zeroDateStr =
        deficitRunwayMonths !== null
          ? getFutureCalendarDate(deficitRunwayMonths, referenceDate)
          : 'ke depan';
      impactSimulation = `Dana ${subject} tergerus ${formatRupiah(burnRate)} setiap bulan. Jika tren ini dibiarkan, saldo kas sebesar ${formatRupiah(cash)} akan habis menyentuh Rp 0 dalam ${deficitRunwayLabel} (sekitar ${zeroDateStr}).`;
    } else {
      const reasons: string[] = [];
      const isThinReserve = emergencyRunwayMonths !== null && emergencyRunwayMonths < 6;
      const isTightRatio = expenseRatio !== null && expenseRatio > maxHealthyRatio;
      const isBreakeven = cashflowCase === 'breakeven';

      if (isBreakeven) {
        reasons.push('arus kas saat ini impas (Rp 0 surplus per bulan)');
      } else if (isTightRatio && expenseRatio !== null) {
        reasons.push(
          `rasio pengeluaran mencapai ${formatPercent(expenseRatio)} (melebihi batas ideal ${maxHealthyRatio}%)`
        );
      }
      if (isThinReserve) {
        reasons.push(
          `ketahanan ${reserveTerm} baru ${emergencyRunwayLabel} (di bawah standar aman 6 bulan)`
        );
      }

      headline = isThinReserve
        ? `Perlu Perhatian: ${isCompany ? 'Cadangan kas' : 'Dana darurat'} baru ${emergencyRunwayLabel} (target 6 bulan)`
        : `Perlu Perhatian: Rasio pengeluaran ${expenseRatio !== null ? formatPercent(expenseRatio) : ''} terlalu mepet`;

      reasonSummary = `Status keuangan ${subject} berada di level Waspada karena ${reasons.join(' dan ')}. Meskipun pemasukan masih menutup pengeluaran bulanan, ruang manuver keuangan masih rentan jika muncul kebutuhan mendesak atau penurunan pendapatan.`;

      if (cashflowCase === 'surplus' && isThinReserve && monthsToSafeReserve !== null) {
        impactSimulation = `Dengan surplus saat ini sebesar ${formatRupiah(netCashflow)} per bulan, Anda masih membutuhkan tambahan ${formatRupiah(emergencyFundGap)} untuk mencapai titik aman 6 bulan (${formatRupiah(targetEmergencyFund)}). Jika seluruh surplus dialokasikan ke tabungan, target aman tercapai dalam sekitar ${monthsToSafeReserve} bulan.`;
      } else if (isBreakeven) {
        impactSimulation = `Karena pemasukan dan pengeluaran persis impas (Rp 0/bulan), saldo kas Anda akan stagnan di ${formatRupiah(cash)} sepanjang 12 bulan ke depan. Jika pemasukan terhenti mendadak, kas hanya bertahan ${emergencyRunwayLabel}.`;
      } else {
        const idealExpenseMax = Math.round((income * maxHealthyRatio) / 100);
        const overBudget = Math.max(0, totalExpenses - idealExpenseMax);
        impactSimulation = `Saldo kas tumbuh ${formatRupiah(netCashflow)}/bulan (menjadi ${formatRupiah(cash + netCashflow * 12)} dalam 12 bulan), namun pengeluaran melebihi batas ideal ${maxHealthyRatio}% sebesar ${formatRupiah(overBudget)}/bulan sehingga laju pertumbuhan kas belum optimal.`;
      }
    }

    if (isCompany) {
      if (cashflowCase === 'deficit') {
        recommendations.push(
          `Manfaatkan runway ${deficitRunwayLabel} untuk segera menyeimbangkan neraca: kurangi biaya sebesar ${formatRupiah(burnRate)}/bulan atau tingkatkan penjualan dengan margin tinggi.`
        );
      } else if (emergencyFundGap > 0) {
        recommendations.push(
          `Prioritaskan penguatan kas operasional hingga mencapai ${formatRupiah(targetEmergencyFund)} (6 bulan beban) dengan menahan dividen sementara dan menyisihkan surplus ${formatRupiah(Math.max(netCashflow, Math.round(income * 0.15)))}/bulan.`
        );
      }
      if (largestExpense) {
        recommendations.push(
          `Evaluasi efisiensi pos terbesar (${largestExpense.name}, ${formatPercent(largestExpense.percentage)} biaya operasional) untuk menjaga rasio pengeluaran tetap di bawah ambang sehat ${maxHealthyRatio}% dari omzet.`
        );
      }
      recommendations.push(
        `Pantau rasio biaya tetap terhadap omzet setiap bulan dan siapkan skenario efisiensi cepat bila omzet turun 15–20%.`
      );
    } else {
      if (cashflowCase === 'deficit') {
        recommendations.push(
          `Segera hentikan penggerusan tabungan sebesar ${formatRupiah(burnRate)}/bulan dengan memangkas pos fleksibel sebelum saldo turun di bawah 6 bulan biaya hidup.`
        );
      } else if (emergencyFundGap > 0 && netCashflow > 0) {
        recommendations.push(
          `Otomatiskan transfer tabungan dana darurat di awal gajian sebesar ${formatRupiah(netCashflow)}/bulan agar target aman 6 bulan (${formatRupiah(targetEmergencyFund)}) tercapai dalam ${monthsToSafeReserve ?? '-'} bulan.`
        );
      } else {
        const idealCut = Math.max(Math.round(totalExpenses - (income * 80) / 100), Math.round(totalExpenses * 0.1));
        recommendations.push(
          `Ciptakan ruang menabung minimal 20% dari pendapatan dengan menekan pengeluaran sekitar ${formatRupiah(idealCut)}/bulan.`
        );
      }
      if (largestExpense) {
        recommendations.push(
          `Tinjau kembali alokasi ${largestExpense.name} (${formatPercent(largestExpense.percentage)} dari total pengeluaran) untuk mencari potensi penghematan 10–15% tanpa menurunkan kualitas hidup utama.`
        );
      }
      recommendations.push(
        `Simpan dana darurat di instrumen likuid terpisah (rekening tabungan terpisah atau reksa dana pasar uang) agar tidak tercampur dengan pengeluaran harian.`
      );
    }
  } else {
    // HEALTHY
    const surplusMonthsOverTarget =
      emergencyRunwayMonths !== null ? Math.max(0, emergencyRunwayMonths - 6) : 0;

    headline = `Keuangan Sehat: Surplus ${formatRupiah(netCashflow)}/bulan & ketahanan ${emergencyRunwayLabel}`;
    reasonSummary = `Status keuangan ${subject} berada pada level Sehat karena arus kas bulanan surplus dengan rasio pengeluaran terjaga di ${expenseRatio !== null ? formatPercent(expenseRatio) : '0%'} (di bawah batas ideal ${maxHealthyRatio}%), sekaligus memiliki ketahanan ${reserveTerm} selama ${emergencyRunwayLabel} (melampaui standar aman minimal 6 bulan).`;

    impactSimulation = `Dengan tren surplus ${formatRupiah(netCashflow)} per bulan, kas ${subject} diproyeksikan bertambah ${formatRupiah(netCashflow * 12)} dalam 12 bulan ke depan menjadi ${formatRupiah(cash + netCashflow * 12)}. Cadangan saat ini juga memiliki bantalan ekstra ${formatMonthsAndDays(surplusMonthsOverTarget)} di atas standar aman 6 bulan (${formatRupiah(targetEmergencyFund)}).`;

    if (isCompany) {
      recommendations.push(
        `Pertahankan disiplin rasio biaya di bawah ${maxHealthyRatio}% dari omzet sambil mengalokasikan sebagian surplus (${formatRupiah(Math.round(netCashflow * 0.5))}/bulan) untuk ekspansi terukur atau peningkatan produktivitas tim.`
      );
      if (largestExpense) {
        recommendations.push(
          `Pantau konsistensi ROI pada pos terbesar (${largestExpense.name}, ${formatPercent(largestExpense.percentage)} biaya) agar pertumbuhan biaya tidak mendahului pertumbuhan omzet.`
        );
      }
      recommendations.push(
        `Tempatkan kelebihan kas di atas kebutuhan 6 bulan operasional (${formatRupiah(Math.max(0, cash - targetEmergencyFund))}) pada instrumen kas berimbal hasil likuid (deposito jangka pendek atau pasar uang korporasi).`
      );
    } else {
      recommendations.push(
        `Karena dana darurat 6 bulan (${formatRupiah(targetEmergencyFund)}) sudah terpenuhi, alokasikan surplus rutin ${formatRupiah(netCashflow)}/bulan ke instrumen investasi jangka menengah–panjang sesuai profil risiko.`
      );
      if (largestExpense) {
        recommendations.push(
          `Jaga agar pos terbesar Anda (${largestExpense.name}, ${formatPercent(largestExpense.percentage)} dari pengeluaran) tidak mengalami kenaikan gaya hidup (lifestyle inflation) saat pendapatan naik.`
        );
      }
      recommendations.push(
        `Lakukan evaluasi ulang setiap 3–6 bulan atau ketika terjadi perubahan besar pada pendapatan maupun tanggungan bulanan.`
      );
    }
  }

  return {
    headline,
    reasonSummary,
    largestExpenseNote,
    impactSimulation,
    recommendations,
  };
}

export function analyzeFinances(
  mode: FinanceMode,
  data: ModeFinancialData,
  referenceDate: Date = new Date()
): FinancialAnalysis {
  const cash = sanitizeAmount(data.cash);
  const income = sanitizeAmount(data.income);
  const cleanExpenses: ExpenseItem[] = data.expenses.map((item) => ({
    ...item,
    amount: sanitizeAmount(item.amount),
  }));

  const totalExpenses = cleanExpenses.reduce((sum, item) => sum + item.amount, 0);
  const netCashflow = income - totalExpenses;
  const maxHealthyRatio = mode === 'personal' ? 80 : 85;

  let expenseRatio: number | null = null;
  let expenseRatioLabel = '0%';

  if (totalExpenses === 0) {
    expenseRatio = 0;
    expenseRatioLabel = '0%';
  } else if (income === 0) {
    expenseRatio = null;
    expenseRatioLabel = '100%+ / Tanpa Pemasukan';
  } else {
    expenseRatio = (totalExpenses / income) * 100;
    expenseRatioLabel = formatPercent(expenseRatio);
  }

  let cashflowCase: CashflowCase;
  if (totalExpenses === 0) {
    cashflowCase = 'no_expenses';
  } else if (totalExpenses > income) {
    cashflowCase = 'deficit';
  } else if (income > totalExpenses) {
    cashflowCase = 'surplus';
  } else {
    cashflowCase = 'breakeven';
  }

  const burnRate = cashflowCase === 'deficit' ? totalExpenses - income : 0;

  const deficitRunwayMonths =
    cashflowCase === 'deficit' && burnRate > 0 ? cash / burnRate : null;

  const deficitRunwayLabel =
    deficitRunwayMonths !== null ? formatMonthsAndDays(deficitRunwayMonths) : '-';

  const emergencyRunwayMonths = totalExpenses > 0 ? cash / totalExpenses : null;
  const emergencyRunwayLabel =
    emergencyRunwayMonths !== null
      ? formatMonthsAndDays(emergencyRunwayMonths)
      : 'Belum ada pengeluaran';

  let cashflowStatusLabel = '';
  if (cashflowCase === 'no_expenses') {
    cashflowStatusLabel = 'Belum ada pengeluaran tercatat';
  } else if (cashflowCase === 'deficit') {
    cashflowStatusLabel = `Defisit (${formatRupiah(-burnRate)} / bulan)`;
  } else if (cashflowCase === 'surplus') {
    cashflowStatusLabel = `Bertumbuh (${formatRupiah(netCashflow, { showSign: true })} / bulan)`;
  } else {
    cashflowStatusLabel = 'Impas (Rp 0 / bulan)';
  }

  const targetEmergencyFund = totalExpenses * 6;
  const emergencyFundGap = Math.max(0, targetEmergencyFund - cash);
  const monthsToSafeReserve =
    emergencyFundGap > 0 && netCashflow > 0 ? Math.ceil(emergencyFundGap / netCashflow) : null;

  let healthLevel: HealthLevel;
  let healthLabel: string;
  let healthShortLabel: string;

  if (cashflowCase === 'no_expenses') {
    healthLevel = 'unassessed';
    healthLabel = 'Belum Ada Pengeluaran';
    healthShortLabel = 'Belum Dinilai';
  } else if (
    cash === 0 ||
    (cashflowCase === 'deficit' && deficitRunwayMonths !== null && deficitRunwayMonths < 6)
  ) {
    healthLevel = 'critical';
    healthLabel = 'Tidak Sehat / Kritis';
    healthShortLabel = 'Tidak Sehat';
  } else if (
    cashflowCase === 'surplus' &&
    expenseRatio !== null &&
    expenseRatio <= maxHealthyRatio &&
    emergencyRunwayMonths !== null &&
    emergencyRunwayMonths >= 6
  ) {
    healthLevel = 'healthy';
    healthLabel = 'Sehat';
    healthShortLabel = 'Sehat';
  } else {
    healthLevel = 'warning';
    healthLabel = 'Waspada / Perlu Perhatian';
    healthShortLabel = 'Waspada';
  }

  const positiveExpenses = cleanExpenses.filter((item) => item.amount > 0);
  const sortedExpenses = [...positiveExpenses].sort((a, b) => b.amount - a.amount);

  const expenseBreakdown = sortedExpenses.map((item) => ({
    id: item.id,
    name: item.name.trim() || 'Pengeluaran Lainnya',
    amount: item.amount,
    percentage: totalExpenses > 0 ? (item.amount / totalExpenses) * 100 : 0,
  }));

  const largestExpense: LargestExpenseInfo | null =
    expenseBreakdown.length > 0 ? expenseBreakdown[0] : null;

  const { projection, zeroCrossMonth } = buildProjection(cash, netCashflow, referenceDate);

  const diagnostic = buildSmartDiagnostic({
    mode,
    cash,
    income,
    totalExpenses,
    netCashflow,
    expenseRatio,
    maxHealthyRatio,
    cashflowCase,
    burnRate,
    deficitRunwayMonths,
    deficitRunwayLabel,
    emergencyRunwayMonths,
    emergencyRunwayLabel,
    targetEmergencyFund,
    emergencyFundGap,
    monthsToSafeReserve,
    healthLevel,
    largestExpense,
    referenceDate,
  });

  return {
    mode,
    cash,
    income,
    totalExpenses,
    netCashflow,
    expenseRatio,
    expenseRatioLabel,
    maxHealthyRatio,
    cashflowCase,
    burnRate,
    deficitRunwayMonths,
    deficitRunwayLabel,
    emergencyRunwayMonths,
    emergencyRunwayLabel,
    cashflowStatusLabel,
    targetEmergencyFund,
    emergencyFundGap,
    monthsToSafeReserve,
    healthLevel,
    healthLabel,
    healthShortLabel,
    largestExpense,
    expenseBreakdown,
    projection,
    zeroCrossMonth,
    diagnostic,
  };
}
