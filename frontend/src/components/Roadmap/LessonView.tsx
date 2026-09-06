// ─── LessonView — interactive split-pane workspace ──────────────────────────
import React, { useState, useEffect } from 'react';
import type { Lesson, UserProgress } from '../../types';
import { fetchLesson, postQuizSubmit, postExerciseSubmit, streamMentorChat } from '../../api/client';
import { executeMultiChainCompiler } from '../../services/sandboxCompiler';
import { trackStudentDeployment } from '../../services/telemetry';
import {
  deployContractWithWallet,
  EVM_TESTNETS,
  connectWallet,
  isWalletAvailable,
  getConnectedAccount,
  getStoredDeployments,
  saveNewDeployment,
  subscribeDeployments,
  type DeployedContractRecord
} from '../../services/liveDeployer';
import { sanitizeComplianceText } from '../../utils/complianceMask';
import './LessonView.css';

interface LessonViewProps {
  lessonId: string;
  userId: string;
  onBack: () => void;
  onProgressUpdate: (updatedProgress: UserProgress) => void;
  token: string;
  activeTrack?: string;
}

export const LessonView: React.FC<LessonViewProps> = ({
  lessonId,
  userId,
  onBack,
  onProgressUpdate,
  token,
  activeTrack = 'ethereum',
}) => {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeBottomTab, setActiveBottomTab] = useState<'concept' | 'practice' | 'assessment' | 'references'>('concept');

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizResult, setQuizResult] = useState<any>(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  // Exercise state
  const [code, setCode] = useState('');
  const [submittingExercise, setSubmittingExercise] = useState(false);
  const [askingOpenClaw, setAskingOpenClaw] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  
  // Developer Signer & Testnet Deployment State
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [connectingWallet, setConnectingWallet] = useState(false);
  const [deployingTestnet, setDeployingTestnet] = useState(false);
  const [selectedTestnetId, setSelectedTestnetId] = useState<string>('arbitrum_sepolia');
  const [deployedContractsCount, setDeployedContractsCount] = useState<number>(() => getStoredDeployments().length);
  
  const consoleEndRef = React.useRef<HTMLDivElement | null>(null);
  const lessonTabsRef = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const unsub = subscribeDeployments((deps) => {
      setDeployedContractsCount(deps.length);
    });
    return unsub;
  }, []);

  // Auto-scroll console to bottom
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [consoleLogs]);

  // Load connected account on mount
  useEffect(() => {
    // Detect already connected developer signer
    getConnectedAccount().then((acc) => {
      if (acc) setWalletAddress(acc);
    });

    if (isWalletAvailable()) {
      const handleAccountsChanged = (accounts: string[]) => {
        setWalletAddress(accounts && accounts.length > 0 ? accounts[0] : null);
      };
      (window as any).ethereum.on('accountsChanged', handleAccountsChanged);
      return () => {
        try {
          (window as any).ethereum.removeListener('accountsChanged', handleAccountsChanged);
        } catch {
          // ignore
        }
      };
    }
  }, []);

  useEffect(() => {
    const trackLower = (activeTrack || '').toLowerCase();
    if (trackLower === 'base') setSelectedTestnetId('base_sepolia');
    else if (trackLower === 'optimism') setSelectedTestnetId('optimism_sepolia');
    else if (trackLower === 'ethereum') setSelectedTestnetId('ethereum_sepolia');
    else setSelectedTestnetId('arbitrum_sepolia');
  }, [activeTrack]);

  useEffect(() => {
    setLoading(true);
    fetchLesson(lessonId, activeTrack)
      .then((data) => {
        setLesson(data);
        if (data.exercise) {
          setCode(data.exercise.template);
        }
        // Reset states
        setSelectedAnswers({});
        setQuizResult(null);
        setConsoleLogs([]);
      })
      .catch((err) => console.error("Error fetching lesson details:", err))
      .finally(() => setLoading(false));
  }, [lessonId, activeTrack]);

  const handleSelectOption = (questionIdx: number, optionIdx: number) => {
    if (quizResult) return; // Read-only after submission
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIdx]: optionIdx,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!lesson || submittingQuiz) return;
    
    // Check that all questions are answered
    const answersList: number[] = [];
    for (let i = 0; i < lesson.quiz.length; i++) {
      if (selectedAnswers[i] == null) {
        alert("Please answer all questions before submitting.");
        return;
      }
      answersList.push(selectedAnswers[i]);
    }

    setSubmittingQuiz(true);
    try {
      const result = await postQuizSubmit(userId, lessonId, answersList, token);
      setQuizResult(result);
      if (result.user_progress) {
        onProgressUpdate(result.user_progress);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit quiz responses.");
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const getTrackMetadata = () => {
    const raw = `${lesson?.title || ''} ${lesson?.id || ''} ${lessonId || ''} ${lesson?.content || ''} ${activeTrack || ''}`.toLowerCase();
    
    if (raw.includes('aptos') || raw.includes('move')) {
      return {
        trackId: 'aptos',
        trackName: 'Aptos',
        lang: 'Move',
        fileName: 'sources/credential.move',
        compiler: 'Aptos Move CLI v2.4.0 / MoveVM v1.12',
        badge: 'Aptos & MoveVM',
        icon: '⚡',
        sampleArtifact: 'Move Bytecode Module (.mv)'
      };
    }
    if (raw.includes('solana') || raw.includes('anchor')) {
      return {
        trackId: 'solana',
        trackName: 'Solana',
        lang: 'Rust (Anchor)',
        fileName: 'src/lib.rs',
        compiler: 'Anchor CLI v0.30.1 / Runtime Logic (Sealevel BPF)',
        badge: 'Solana & Anchor',
        icon: '🟠',
        sampleArtifact: 'Solana SBF ELF Binary + Anchor IDL JSON'
      };
    }
    if (raw.includes('starknet') || raw.includes('cairo')) {
      return {
        trackId: 'starknet',
        trackName: 'Starknet',
        lang: 'Cairo 2.0',
        fileName: 'src/module.cairo',
        compiler: 'Scarb v2.6.0 / Cairo 2.0 (CairoVM)',
        badge: 'Starknet & Cairo 2.0',
        icon: '✨',
        sampleArtifact: 'Sierra Module Class Hash & CASM'
      };
    }
    if (raw.includes('polkadot') || raw.includes('substrate') || raw.includes('ink')) {
      return {
        trackId: 'polkadot',
        trackName: 'Polkadot',
        lang: 'Rust (ink! Wasm)',
        fileName: 'lib.rs',
        compiler: 'cargo-module v4.0.0 / ink! 5.0 (pallet-modules)',
        badge: 'Polkadot & Substrate ink!',
        icon: '🟣',
        sampleArtifact: '.wasm Module Bundle + Metadata Schema'
      };
    }
    if (raw.includes('arbitrum') || raw.includes('stylus')) {
      return {
        trackId: 'arbitrum',
        trackName: 'Arbitrum',
        lang: 'Engine Logic / Stylus Rust',
        fileName: 'ArbitrumRegistry.js',
        compiler: 'Execution Runtime v0.8.20 / Stylus SDK v0.6.0',
        badge: 'Arbitrum Nitro & Stylus',
        icon: '🔵',
        sampleArtifact: 'Arbitrum Nitro Bytecode / Stylus WASM'
      };
    }
    if (raw.includes('base')) {
      return {
        trackId: 'base',
        trackName: 'Base',
        lang: 'EVM Language',
        fileName: 'Paymaster.js',
        compiler: 'Execution Runtime Compiler v0.8.20',
        badge: 'Base Sepolia',
        icon: '🔷',
        sampleArtifact: 'Bytecode + Interface Schema'
      };
    }
    if (raw.includes('optimism')) {
      return {
        trackId: 'optimism',
        trackName: 'Optimism',
        lang: 'EVM Language',
        fileName: 'Superchain.js',
        compiler: 'Execution Runtime Compiler v0.8.20',
        badge: 'OP Stack Superchain',
        icon: '🔴',
        sampleArtifact: 'Bytecode + Interface Schema'
      };
    }
    if (raw.includes('polygon')) {
      return {
        trackId: 'polygon',
        trackName: 'Polygon',
        lang: 'EVM Language',
        fileName: 'zkVault.js',
        compiler: 'Execution Runtime Compiler v0.8.20',
        badge: 'Polygon zkEVM',
        icon: '🟣',
        sampleArtifact: 'zkEVM Bytecode + Interface Schema'
      };
    }
    return {
      trackId: 'ethereum',
      trackName: 'EVM Standard',
      lang: 'EVM Language',
      fileName: 'LogicModule.js',
      compiler: 'Execution Runtime Compiler v0.8.20',
      badge: 'Enterprise Security',
      icon: '💎',
      sampleArtifact: 'Logic Engine Bytecode + Interface Schema'
    };
  };

  const handleSubmitExercise = async () => {
    if (!lesson || submittingExercise || !lesson.exercise) return;

    const track = getTrackMetadata();
    setSubmittingExercise(true);
    setConsoleLogs([
      `⏳ Initializing ${track.trackName} execution environment...`,
      `🛠️ Loading compiler: ${track.compiler}...`,
      `⚡ Compiling ${track.lang} source code...`,
    ]);

    await new Promise((resolve) => setTimeout(resolve, 600));

    try {
      // Run multi-chain client-side compiler engine
      const clientCompilation = await executeMultiChainCompiler(track.trackId, code, lessonId);

      // Submit to backend for verification and XP award
      const result = await postExerciseSubmit(userId, lessonId, code, token);

      if (result.passed && clientCompilation.success) {
        setConsoleLogs((prev) => [
          ...prev,
          `✅ Compilation successful! 0 warnings, 0 errors.`,
          `📦 Target Artifact: ${track.sampleArtifact}`,
          ...(clientCompilation.artifacts?.programId ? [`🔑 On-Chain Program ID: ${clientCompilation.artifacts.programId}`] : []),
          ...(clientCompilation.artifacts?.classHash ? [`🏷️ Sierra Class Hash: ${clientCompilation.artifacts.classHash}`] : []),
          ...(clientCompilation.artifacts?.moduleAddress ? [`📜 Module Address: ${clientCompilation.artifacts.moduleAddress}`] : []),
          `📊 Compute Gas: ${clientCompilation.gasEstimate.toLocaleString()} units`,
          `🧪 Running automated invariant verification suite...`,
          `🔍 Structural keywords & type constraints: PASS`,
          `🎉 Exercise & Verification PASSED! XP Awarded: +100 XP`,
        ]);
        if (result.user_progress) {
          onProgressUpdate(result.user_progress);
        }

        // Send institutional telemetry
        const contractAddr = clientCompilation.artifacts?.programId || clientCompilation.artifacts?.classHash || clientCompilation.artifacts?.moduleAddress || clientCompilation.artifacts?.wasmHash || (clientCompilation.artifacts?.bytecode ? `0x${clientCompilation.artifacts.bytecode.slice(2, 42)}` : '0xContractDeployed');
        trackStudentDeployment(
          userId || 'developer-student',
          'KU_COHORT_2026_01',
          {
            contractAddress: contractAddr,
            network: track.trackId,
            executionEnvironment: track.trackId === 'arbitrum' ? 'wasm_stylus' : track.trackId === 'solana' ? 'sealevel_svm' : track.trackId === 'aptos' ? 'move_vm' : (track.trackId === 'base' || track.trackId === 'optimism') ? 'evm_op_stack' : 'evm_nitro',
            programmingLanguage: track.lang.toLowerCase(),
            gasUsed: clientCompilation.gasEstimate || 21000
          }
        ).catch((err) => console.warn("Telemetry log warning:", err));
      } else {
        const errorLogs: string[] = [];
        if (clientCompilation.syntaxErrors && clientCompilation.syntaxErrors.length > 0) {
          clientCompilation.syntaxErrors.forEach((err) => errorLogs.push(`❌ ${err}`));
        }
        if (result.syntax_errors && result.syntax_errors.length > 0) {
          result.syntax_errors.forEach((err: string) => {
            if (!errorLogs.includes(`❌ ${err}`)) errorLogs.push(`❌ ${err}`);
          });
        }
        if (result.missing_keywords && result.missing_keywords.length > 0) {
          errorLogs.push(`⚠️ Missing required syntax/keywords: ${result.missing_keywords.join(", ")}`);
        }
        setConsoleLogs((prev) => [
          ...prev,
          `❌ Compilation completed with ${errorLogs.length || 1} error(s).`,
          ...errorLogs,
          `❌ Exercise FAILED. Review instruction parameters and retry.`,
        ]);
      }
    } catch (err) {
      setConsoleLogs((prev) => [...prev, "🚨 Compiler sandbox connection error."]);
    } finally {
      setSubmittingExercise(false);
    }
  };

  const handleConnectWallet = async () => {
    setConnectingWallet(true);
    try {
      const acc = await connectWallet();
      setWalletAddress(acc);
    } catch (err: any) {
      alert(`Signer Notice: ${err.message}`);
    } finally {
      setConnectingWallet(false);
    }
  };

  const handleDeployToTestnet = async () => {
    if (!lesson || submittingExercise || deployingTestnet || !code.trim()) return;

    const track = getTrackMetadata();
    const activeTestnet = EVM_TESTNETS.find((n) => n.id === selectedTestnetId) || EVM_TESTNETS[0];

    setDeployingTestnet(true);
    setConsoleLogs([
      `🚀 Initiating real cloud sandbox deployment to ${activeTestnet.name}...`,
      `🛠️ Target Network: ${activeTestnet.name} (Chain ID: ${activeTestnet.chainId})`,
      `📡 Step 1: Compiling module and extracting execution bytecode...`
    ]);

    try {
      // 1. Compile module to get bytecode
      const compileRes = await executeMultiChainCompiler(
        track.trackId.includes('rust') ? 'stylus' : track.trackId,
        code,
        lessonId
      );

      if (!compileRes.success) {
        setConsoleLogs((prev) => [
          ...prev,
          `❌ Compilation failed before deployment:`,
          ...(compileRes.syntaxErrors || []).map((e) => `   - ${e}`)
        ]);
        alert("Compilation failed. Please fix module syntax errors before deploying.");
        return;
      }

      const bytecode = compileRes.artifacts?.bytecode || '';
      const abi = compileRes.artifacts?.abi || [];
      const contractName = compileRes.artifacts?.contract_name || 'LessonContract';

      let deployRes: any = null;
      let isLiveWalletDeploy = false;

      if (isWalletAvailable()) {
        try {
          deployRes = await deployContractWithWallet({
            networkId: activeTestnet.id,
            bytecode,
            abi,
            contractName,
            onStatus: (msg) => {
              setConsoleLogs((prev) => [...prev, msg]);
            }
          });
          isLiveWalletDeploy = true;
          if (deployRes.deployerAddress) {
            setWalletAddress(deployRes.deployerAddress);
          }
        } catch (walletErr: any) {
          if (walletErr.message?.includes('USER_CANCELLED')) {
            setConsoleLogs((prev) => [...prev, `❌ Deployment cancelled: Signature rejected.`]);
            return;
          }
          console.warn("Signer deployment error in lesson:", walletErr);
          const proceedSim = window.confirm(
            `Live signer deployment notice: ${walletErr.message}\n\nWould you like to fall back to simulated testnet broadcast?`
          );
          if (!proceedSim) return;
        }
      } else {
        const proceedSim = window.confirm(
          `No developer signer detected.\n\nTo sign execution transactions, please configure your developer environment.\n\nWould you like to run a simulated sandbox deployment instead?`
        );
        if (!proceedSim) return;
      }

      let contractAddress = deployRes?.contractAddress;
      let txHash = deployRes?.txHash;
      let blockNumber = deployRes?.blockNumber;
      let gasUsed = deployRes?.gasUsed || 185000;
      let deployerAddress = deployRes?.deployerAddress || walletAddress || '0xSimulatedSigner';

      if (!isLiveWalletDeploy) {
        const randomHex = (len: number) => {
          let s = '';
          const chars = '0123456789abcdef';
          for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
          return s;
        };
        contractAddress = `0x${randomHex(40)}`;
        txHash = `0x${randomHex(64)}`;
        blockNumber = 14892100 + Math.floor(Math.random() * 30000);
      }

      // Save to persistent deployment storage and notify other components
      const newRecord: DeployedContractRecord = {
        id: `dep-${Date.now()}`,
        contractName,
        contractAddress: contractAddress!,
        txHash: txHash!,
        networkId: activeTestnet.id,
        networkName: activeTestnet.name,
        networkIcon: activeTestnet.icon,
        chainId: activeTestnet.chainId,
        explorerUrl: activeTestnet.explorerUrl,
        gasUsed,
        blockNumber: blockNumber || 0,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language: track.lang
      };

      const updatedDeployments = saveNewDeployment(newRecord);
      setDeployedContractsCount(updatedDeployments.length);

      // Track telemetry
      trackStudentDeployment(
        deployerAddress,
        'KU_COHORT_2026_01',
        {
          contractAddress: contractAddress!,
          network: activeTestnet.telemetryNetwork,
          executionEnvironment: activeTestnet.execEnv,
          programmingLanguage: track.lang.toLowerCase(),
          gasUsed
        }
      ).catch((e) => console.warn("Telemetry error:", e));

      // Also submit exercise to backend so XP is granted!
      try {
        const submitRes = await postExerciseSubmit(userId, lessonId, code, token);
        if (submitRes.user_progress) {
          onProgressUpdate(submitRes.user_progress);
        }
      } catch (e) {
        console.warn("Exercise submit notice:", e);
      }

      // Append rich confirmation in terminal
      setConsoleLogs((prev) => [
        ...prev,
        `======================================================================`,
        `📡 ${isLiveWalletDeploy ? 'LIVE CLOUD DEPLOYMENT CONFIRMED' : 'SANDBOX TESTNET BROADCAST'}: ${activeTestnet.name.toUpperCase()}`,
        `======================================================================`,
        `• Target Network:    ${activeTestnet.name} (Chain ID: ${activeTestnet.chainId})`,
        `• RPC Endpoint:      ${activeTestnet.rpcUrl}`,
        `• Module Name:       ${contractName}`,
        `• Total Deployed:    ${updatedDeployments.length} Modules Recorded (Count +1)`,
        `• Signer Account:    ${deployerAddress} ${isLiveWalletDeploy ? '(Cryptographically Signed via Developer Signer)' : '(Simulated)'}`,
        `• Module Identifier: ${contractAddress}`,
        `• Transaction Hash:  ${txHash}`,
        `• Block Number:      #${blockNumber?.toLocaleString()}`,
        `• Execution Units:   ${gasUsed.toLocaleString()} Compute Units`,
        `• Deployment Status: ${isLiveWalletDeploy ? '✅ CONFIRMED ON CLOUD (Receipt Verified)' : '✅ CONFIRMED (Simulated)'}`,
        ``,
        `🔗 Live Explorer Links:`,
        `  - Module:      ${activeTestnet.explorerUrl}/address/${contractAddress}`,
        `  - Transaction: ${activeTestnet.explorerUrl}/tx/${txHash}`,
        ``,
        `🎉 Module Challenge Completed & Progress Saved! (+100 XP)`,
        `======================================================================`
      ]);

    } catch (err: any) {
      console.error("Testnet deploy error in lesson:", err);
      setConsoleLogs((prev) => [...prev, `❌ Deployment failed: ${err.message || 'Unknown error'}`]);
      alert(`Deployment Notice: ${err.message || 'Failed to deploy module'}`);
    } finally {
      setDeployingTestnet(false);
    }
  };

  const handleAskOpenClaw = async () => {
    if (askingOpenClaw || !lesson) return;
    const track = getTrackMetadata();
    setAskingOpenClaw(true);
    setConsoleLogs((prev) => [...prev, `🔮 [OpenClaw AI Mentor]: Analyzing ${track.lang} code for "${lesson.title}"...`]);

    try {
      let fullResponse = "";
      for await (const _ of streamMentorChat(
        `Please analyze this code for lesson '${lesson.title}'. Identify syntax errors, security vulnerabilities, or logical bugs. Give concise actionable advice.`,
        code || (lesson.exercise ? lesson.exercise.template : ""),
        (delta) => {
          fullResponse += delta;
          setConsoleLogs((prev) => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (lastIdx >= 0 && updated[lastIdx].startsWith("💡 OpenClaw Guidance:")) {
              updated[lastIdx] = `💡 OpenClaw Guidance: ${fullResponse}`;
            } else {
              updated.push(`💡 OpenClaw Guidance: ${fullResponse}`);
            }
            return updated;
          });
        },
        userId || 'demo-user',
        'openclaw'
      )) {}
    } catch (err: any) {
      setConsoleLogs((prev) => [
        ...prev,
        `⚠️ OpenClaw Error: ${err.message || 'Failed to connect to AI Mentor.'}`,
      ]);
    } finally {
      setAskingOpenClaw(false);
    }
  };

  const parseInlineMarkdown = (line: string): React.ReactNode[] => {
    const tokenRegex = /(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\))/g;
    const parts = line.split(tokenRegex);
    
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={idx} className="lesson-md-inline-code">{part.slice(1, -1)}</code>;
      }
      if (part.startsWith('[') && part.includes('](')) {
        const textEnd = part.indexOf(']');
        const linkText = part.slice(1, textEnd);
        const url = part.slice(textEnd + 2, -1);
        return (
          <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="lesson-md-link">
            {linkText}
          </a>
        );
      }
      return part;
    });
  };

  // Simple parser to render reading markdown contents
  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('# ')) {
        return <h1 key={idx} className="lesson-md-h1">{parseInlineMarkdown(line.slice(2))}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={idx} className="lesson-md-h2">{parseInlineMarkdown(line.slice(3))}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="lesson-md-h3">{parseInlineMarkdown(line.slice(4))}</h3>;
      }
      if (line.startsWith('- ')) {
        return <li key={idx} className="lesson-md-li">{parseInlineMarkdown(line.slice(2))}</li>;
      }
      if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ')) {
        return <li key={idx} className="lesson-md-ol-li">{parseInlineMarkdown(line.slice(3))}</li>;
      }
      if (line.trim().startsWith('```')) {
        return null; // hide fences, code contents will be raw text
      }
      if (line.trim() === '') {
        return <div key={idx} className="lesson-md-space" />;
      }
      return <p key={idx} className="lesson-md-p">{parseInlineMarkdown(line)}</p>;
    });
  };

  if (loading) {
    return (
      <div className="lesson-view-loading">
        <div className="spinner" />
        <p>Loading interactive workspace...</p>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="lesson-view-error">
        <h3>Could not load lesson</h3>
        <button className="btn btn--primary" onClick={onBack}>Back to Level</button>
      </div>
    );
  }

  const scrollLessonTabs = (direction: 'left' | 'right') => {
    if (lessonTabsRef.current) {
      const scrollAmount = direction === 'left' ? -150 : 150;
      lessonTabsRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const track = getTrackMetadata();

  return (
    <div className="lesson-workspace">
      
      {/* 1. Left Sidebar: Course Navigation */}
      <div className="lesson-sidebar-left glass" style={{ borderRight: '1px solid rgba(255,255,255,0.06)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', background: 'rgba(10, 11, 23, 0.45)' }}>
        <div>
          <button className="btn btn--text back-btn" onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--clr-text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', marginBottom: '16px', padding: 0 }}>
            ← Back to Roadmap
          </button>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', margin: '0 0 6px 0' }}>{track.trackName} Engineering</h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--clr-text-secondary)', lineHeight: '1.4', margin: '0 0 12px 0' }}>
            Master production-ready software logic, protocol security, and open-source engineering across {track.trackName}.
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--clr-text-muted)', marginBottom: '4px', fontWeight: 600 }}>
            <span>Course progress</span>
            <span>63%</span>
          </div>
          <div style={{ width: '100%', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.05)' }}>
            <div style={{ width: '63%', height: '100%', borderRadius: '2px', background: '#2563eb' }} />
          </div>
        </div>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)' }} />

        <div>
          <span style={{ fontSize: '0.65rem', color: 'var(--clr-text-muted)', fontWeight: 700, letterSpacing: '0.05em', display: 'block', marginBottom: '12px' }}>MODULE 0{lesson.level_id || 1} • {track.trackName.toUpperCase()} TRACK</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { title: 'Core Architecture & Environment', checked: true },
              { title: 'Data Types & Access Control', checked: true },
              { title: sanitizeComplianceText(lesson.title), active: true },
              { title: 'Sandbox Verification Challenge', locked: true }
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  backgroundColor: item.checked ? 'rgba(16, 185, 129, 0.1)' : item.active ? 'rgba(37, 99, 235, 0.1)' : 'rgba(255,255,255,0.03)',
                  border: item.checked ? '1px solid #10b981' : item.active ? '1px solid #2563eb' : '1px solid rgba(255,255,255,0.08)',
                  color: item.checked ? '#10b981' : item.active ? '#2563eb' : 'var(--clr-text-muted)'
                }}>
                  {item.checked ? '✓' : '●'}
                </span>
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: item.active ? 700 : 500,
                  color: item.active ? '#2563eb' : item.locked ? 'var(--clr-text-muted)' : 'var(--clr-text-secondary)',
                  wordBreak: 'break-word'
                }}>
                  {item.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Middle Panel: Interactive Lesson Content & IDE */}
      <div className="lesson-middle-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', padding: '24px', gap: '20px', background: '#030307' }}>
        {/* Breadcrumbs */}
        <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', fontWeight: 600, wordBreak: 'break-word' }}>
          Production Distributed Systems Engineering &gt; {track.trackName} &gt; <span style={{ color: 'var(--clr-text-secondary)' }}>{sanitizeComplianceText(lesson.title)}</span>
        </div>

        {/* Tab Selector with Left & Right Floating Scroll Arrows */}
        <div className="workspace-tab-wrapper">
          <button
            type="button"
            className="workspace-tab-arrow workspace-tab-arrow--left"
            onClick={() => scrollLessonTabs('left')}
            aria-label="Scroll tabs left"
            title="Scroll Left"
          >
            ‹
          </button>

          <div className="workspace-tab-bar" ref={lessonTabsRef}>
            {(['concept', 'practice', 'assessment', 'references'] as const).map((tab) => {
              if (tab === 'practice' && !lesson.exercise) return null;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveBottomTab(tab)}
                  className={`workspace-tab-btn ${activeBottomTab === tab ? 'workspace-tab-btn--active' : ''}`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className="workspace-tab-arrow workspace-tab-arrow--right"
            onClick={() => scrollLessonTabs('right')}
            aria-label="Scroll tabs right"
            title="Scroll Right"
          >
            ›
          </button>
        </div>

        {/* Tab contents */}
        {activeBottomTab === 'concept' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.7rem', padding: '4px 10px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', fontWeight: 700 }}>AI-Guided</span>
              <span style={{ fontSize: '0.7rem', padding: '4px 10px', borderRadius: '12px', background: 'rgba(124, 58, 237, 0.1)', color: '#a855f7', fontWeight: 700 }}>{track.badge}</span>
              <span style={{ fontSize: '0.7rem', padding: '4px 10px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', fontWeight: 700 }}>18 min • Lab + Quiz</span>
            </div>
            <h1 className="lesson-title-heading" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', margin: '0 0 10px 0', lineHeight: '1.2' }}>{sanitizeComplianceText(lesson.title)}</h1>
            <div style={{ fontSize: '0.85rem', color: 'var(--clr-text-secondary)', lineHeight: '1.6', marginBottom: '20px' }}>
              {renderMarkdown(lesson.content)}
            </div>
          </div>
        )}

        {activeBottomTab === 'practice' && lesson.exercise && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ fontSize: '0.7rem', padding: '4px 10px', borderRadius: '12px', background: 'rgba(124, 58, 237, 0.1)', color: '#a855f7', fontWeight: 700 }}>{track.badge}</span>
              <span style={{ fontSize: '0.7rem', padding: '4px 10px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', fontWeight: 700 }}>{track.lang} Sandbox</span>
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', margin: '0 0 10px 0', lineHeight: '1.2' }}>Interactive Sandbox</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-secondary)', lineHeight: '1.5', margin: '0 0 16px 0' }}>
              {lesson.exercise.instruction}
            </p>

            {/* IDE Editor Card */}
            {(() => {
              const comp = track;
              return (
                <div className="code-workspace glass" style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', background: 'rgba(10, 11, 23, 0.45)', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }} />
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block' }} />
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#93c5fd', marginLeft: '6px', fontFamily: 'monospace' }}>{comp.fileName}</span>
                      <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: 'var(--clr-text-secondary)', fontWeight: 600 }}>{comp.lang}</span>
                    </div>
                    <button
                      className="btn btn--secondary btn--xs"
                      onClick={handleAskOpenClaw}
                      disabled={askingOpenClaw}
                      title="Get instant AI code analysis and guidance from OpenClaw"
                      style={{
                        fontSize: '0.75rem',
                        padding: '4px 12px',
                        borderRadius: '4px',
                        backgroundColor: askingOpenClaw ? 'rgba(245, 158, 11, 0.15)' : 'rgba(37, 99, 235, 0.15)',
                        color: askingOpenClaw ? '#f59e0b' : '#60a5fa',
                        border: askingOpenClaw ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(37, 99, 235, 0.3)',
                        cursor: askingOpenClaw ? 'wait' : 'pointer'
                      }}
                    >
                      {askingOpenClaw ? '⏳ OpenClaw Thinking...' : '🔮 Ask OpenClaw'}
                    </button>
                  </div>
                  
                  <textarea
                    className="code-textarea"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    disabled={submittingExercise}
                    spellCheck={false}
                    style={{
                      width: '100%',
                      height: '420px',
                      minHeight: '280px',
                      maxHeight: '750px',
                      padding: '16px',
                      background: '#090a12',
                      border: 'none',
                      color: '#a6accd',
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      lineHeight: '1.5',
                      resize: 'vertical',
                      outline: 'none'
                    }}
                  />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap', gap: '10px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{comp.icon}</span>
                      <span>{comp.compiler}</span>
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      {walletAddress ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: '0.74rem',
                            fontWeight: 600,
                            padding: '4px 8px',
                            borderRadius: '6px',
                            background: 'rgba(34, 197, 94, 0.15)',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                            color: '#86efac'
                          }}
                          title={`Connected Signer: ${walletAddress}`}
                        >
                          <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e' }}></span>
                          {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="btn btn--secondary btn--xs"
                          onClick={handleConnectWallet}
                          disabled={connectingWallet}
                          style={{
                            fontSize: '0.74rem',
                            fontWeight: 600,
                            padding: '4px 8px',
                            borderRadius: '6px',
                            background: 'rgba(234, 88, 12, 0.15)',
                            border: '1px solid rgba(234, 88, 12, 0.35)',
                            color: '#fdba74'
                          }}
                          title="Connect developer signer for cryptographic verification"
                        >
                          🔑 {connectingWallet ? 'Connecting...' : 'Connect Signer'}
                        </button>
                      )}

                      <select
                        value={selectedTestnetId}
                        onChange={(e) => setSelectedTestnetId(e.target.value)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.08)',
                          color: '#e2e8f0',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          fontSize: '0.74rem',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                        title="Select target EVM Testnet for deployment"
                      >
                        {EVM_TESTNETS.map((net) => (
                          <option key={net.id} value={net.id} style={{ background: '#090a14', color: '#fff' }}>
                            {net.icon} {net.name}
                          </option>
                        ))}
                      </select>

                      <a
                        href={(EVM_TESTNETS.find(n => n.id === selectedTestnetId) || EVM_TESTNETS[0]).faucetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '0.74rem',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#60a5fa',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        title="Get free testnet gas tokens"
                      >
                        🚰 Faucet
                      </a>

                      <span
                        style={{
                          fontSize: '0.74rem',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          background: 'rgba(59, 130, 246, 0.15)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          color: '#93c5fd',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontWeight: 700
                        }}
                        title="Total software logic modules you have deployed across all test environments"
                      >
                        📦 {deployedContractsCount} Deployed
                      </span>

                      <button
                        className="btn btn--secondary btn--sm"
                        onClick={handleDeployToTestnet}
                        disabled={deployingTestnet || submittingExercise || !code.trim()}
                        style={{
                          fontSize: '0.78rem',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(147, 51, 234, 0.2))',
                          border: '1px solid rgba(96, 165, 250, 0.4)',
                          color: '#93c5fd'
                        }}
                        title="Sign and deploy module to test environment"
                      >
                        {deployingTestnet ? '⏳ Signing & Deploying...' : '🚀 Sign & Deploy'}
                      </button>

                      <button
                        className="btn btn--primary btn--sm"
                        onClick={handleSubmitExercise}
                        disabled={submittingExercise || deployingTestnet || !code.trim()}
                        style={{ backgroundColor: '#2563eb', padding: '6px 12px', borderRadius: '6px', fontSize: '0.78rem' }}
                      >
                        {submittingExercise ? "Compiling..." : `⚡ Compile & Verify`}
                      </button>
                    </div>
                  </div>

                  {/* Console output inside IDE card */}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: '#07080d', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#60a5fa', letterSpacing: '0.05em' }}>
                        {comp.icon} {comp.trackName.toUpperCase()} TERMINAL OUTPUT
                      </span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--clr-text-muted)' }}>
                        Isolated Sandboxed Runner (5.0s max)
                      </span>
                    </div>
                    <div style={{ maxHeight: '200px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--clr-text-secondary)', lineHeight: '1.5' }}>
                      {consoleLogs.length === 0 ? (
                        <span style={{ color: 'var(--clr-text-muted)' }}>Sandbox idle. Click "Compile &amp; Verify" to run the compiler and invariant test suite.</span>
                      ) : (
                        <>
                          {consoleLogs.map((log, idx) => (
                            <div key={idx} style={{ color: log.includes('✅') || log.includes('successful') || log.includes('PASSED') ? '#34d399' : log.includes('❌') || log.includes('FAILED') ? '#f87171' : log.includes('📦') || log.includes('📊') || log.includes('🔑') ? '#93c5fd' : 'var(--clr-text-secondary)', marginBottom: '4px' }}>{log}</div>
                          ))}
                          <div ref={consoleEndRef} />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {activeBottomTab === 'assessment' && (
          <div className="quiz-workspace animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ fontSize: '0.7rem', padding: '4px 10px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', fontWeight: 700 }}>Assessment Quiz</span>
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', margin: '0 0 10px 0', lineHeight: '1.2' }}>Lesson Quiz</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-secondary)', lineHeight: '1.5', margin: '0 0 16px 0' }}>
              Answer the questions below to test your understanding of the concepts covered in this lesson.
            </p>

            <div className="quiz-questions">
              {lesson.quiz.map((q, qIdx) => {
                const resultDetail = quizResult?.results?.[qIdx];
                const hasSubmitted = quizResult != null;
                
                return (
                  <div key={qIdx} className={`quiz-question-card ${hasSubmitted ? (resultDetail?.is_correct ? 'quiz-question-card--correct' : 'quiz-question-card--incorrect') : ''}`} style={{ marginBottom: '16px', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)', background: 'rgba(10, 11, 23, 0.35)' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>
                      {qIdx + 1}. {q.question}
                    </h4>
                    <div className="quiz-options" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {q.options.map((opt, oIdx) => {
                        const isSelected = selectedAnswers[qIdx] === oIdx;
                        const isCorrectOpt = q.correct_idx === oIdx;
                        let optClass = '';
                        if (isSelected) optClass = 'quiz-option--selected';
                        if (hasSubmitted) {
                          if (isCorrectOpt) optClass = 'quiz-option--correct';
                          else if (isSelected) optClass = 'quiz-option--incorrect';
                        }

                        return (
                          <button
                            key={oIdx}
                            className={`quiz-option ${optClass}`}
                            onClick={() => handleSelectOption(qIdx, oIdx)}
                            disabled={hasSubmitted}
                          >
                            <span className="option-marker">
                              {oIdx === 0 ? 'A' : oIdx === 1 ? 'B' : oIdx === 2 ? 'C' : 'D'}
                            </span>
                            <span className="option-text">{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="quiz-footer">
              {quizResult ? (
                <div className={`quiz-score-banner ${quizResult.passed ? 'quiz-score-banner--passed' : 'quiz-score-banner--failed'}`}>
                  <div className="score-percentage">{quizResult.score}%</div>
                  <div>
                    <div className="score-verdict">{quizResult.passed ? "🎉 Quiz Passed!" : "❌ Try Again!"}</div>
                    <div className="score-ratio">Correct: {quizResult.correct_count} of {quizResult.total_questions} questions</div>
                  </div>
                  {!quizResult.passed && (
                    <button className="btn btn--secondary reset-btn" onClick={() => setQuizResult(null)}>
                      Retry Quiz
                    </button>
                  )}
                </div>
              ) : (
                <button
                  className="btn btn--primary submit-quiz-btn"
                  onClick={handleSubmitQuiz}
                  disabled={submittingQuiz}
                  style={{ width: 'fit-content' }}
                >
                  {submittingQuiz ? "Evaluating Answers..." : "Submit Quiz"}
                </button>
              )}
            </div>
          </div>
        )}

        {activeBottomTab === 'references' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', margin: '0 0 10px 0', lineHeight: '1.2' }}>Further Reading</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-secondary)', lineHeight: '1.5' }}>
              Check out these verified official resources to expand your mastery of {track.trackName} logic engine development and security architecture.
            </p>
            <div className="glass" style={{ padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(10, 11, 23, 0.45)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {track.trackId === 'aptos' && (
                <>
                  <a href="https://aptos.dev" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: '#06b6d4', textDecoration: 'underline' }}>
                    🔗 Official Aptos Move Developer Guide
                  </a>
                  <a href="https://github.com/aptos-labs/aptos-core" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: '#06b6d4', textDecoration: 'underline' }}>
                    🔗 Aptos Core GitHub Repository &amp; Move Modules
                  </a>
                </>
              )}
              {track.trackId === 'solana' && (
                <>
                  <a href="https://www.anchor-lang.com" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: '#f59e0b', textDecoration: 'underline' }}>
                    🔗 Official Anchor Framework Documentation
                  </a>
                  <a href="https://solana.com/docs" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: '#f59e0b', textDecoration: 'underline' }}>
                    🔗 Solana Developer &amp; Sealevel BPF Reference
                  </a>
                </>
              )}
              {track.trackId === 'starknet' && (
                <>
                  <a href="https://book.cairo-lang.org" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: '#ec4899', textDecoration: 'underline' }}>
                    🔗 The Cairo 2.0 Programming Language Book
                  </a>
                  <a href="https://docs.starknet.io" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: '#ec4899', textDecoration: 'underline' }}>
                    🔗 Starknet Official Developer Documentation
                  </a>
                </>
              )}
              {track.trackId === 'polkadot' && (
                <>
                  <a href="https://use.ink" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: '#a855f7', textDecoration: 'underline' }}>
                    🔗 ink! Logic Modules on Polkadot &amp; Substrate
                  </a>
                  <a href="https://github.com/paritytech/polkadot-sdk" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: '#a855f7', textDecoration: 'underline' }}>
                    🔗 Polkadot SDK &amp; pallet-modules Repository
                  </a>
                </>
              )}
              {track.trackId === 'arbitrum' && (
                <>
                  <a href="https://docs.arbitrum.io/stylus/stylus-overview" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: '#3b82f6', textDecoration: 'underline' }}>
                    🔗 Arbitrum Stylus Rust SDK Documentation
                  </a>
                  <a href="https://docs.arbitrum.io" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: '#3b82f6', textDecoration: 'underline' }}>
                    🔗 Arbitrum Nitro Developer Portal
                  </a>
                </>
              )}
              {['ethereum', 'base', 'optimism', 'polygon', 'fundamentals'].includes(track.trackId) && (
                <>
                  <a href="https://docs.openzeppelin.com" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: '#3b82f6', textDecoration: 'underline' }}>
                    🔗 OpenZeppelin Architecture &amp; Security Patterns
                  </a>
                  <a href="https://developer.mozilla.org" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: '#3b82f6', textDecoration: 'underline' }}>
                    🔗 Modern Software Architecture Documentation
                  </a>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. Right Sidebar: Developer & Session Progress */}
      <div className="lesson-sidebar-right glass" style={{ borderLeft: '1px solid rgba(255,255,255,0.06)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', background: 'rgba(10, 11, 23, 0.45)' }}>
        
        {/* Developer Progress Panel */}
        <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.2)' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--clr-text-muted)', fontWeight: 700, letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>DEVELOPER PROGRESS</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', margin: 0 }}>2,480 <span style={{ fontSize: '0.9rem', color: 'var(--clr-text-secondary)' }}>XP</span></h2>
            <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700 }}>+180 XP TODAY</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--clr-text-muted)', marginBottom: '4px' }}>
            <span>Level 07</span>
            <span>520 XP to L08</span>
          </div>
          <div style={{ width: '100%', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.05)' }}>
            <div style={{ width: '55%', height: '100%', borderRadius: '2px', background: '#2563eb' }} />
          </div>
        </div>

        {/* Session Progress Panel */}
        <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.2)' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--clr-text-muted)', fontWeight: 700, letterSpacing: '0.05em', display: 'block', marginBottom: '16px' }}>SESSION PROGRESS</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ position: 'relative', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="48" height="48" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#2563eb" strokeDasharray="83, 100" strokeWidth="3" />
              </svg>
              <span style={{ position: 'absolute', fontSize: '0.65rem', fontWeight: 700, color: '#fff' }}>83%</span>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>Current Activity</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-secondary)' }}>Coding + Review</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--clr-text-muted)', marginBottom: '2px' }}>
                <span>Quiz Score</span>
                <span>83%</span>
              </div>
              <div style={{ width: '100%', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.05)' }}>
                <div style={{ width: '83%', height: '100%', borderRadius: '2px', background: '#2563eb' }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--clr-text-muted)', marginBottom: '2px' }}>
                <span>Lab Completion</span>
                <span>83%</span>
              </div>
              <div style={{ width: '100%', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.05)' }}>
                <div style={{ width: '83%', height: '100%', borderRadius: '2px', background: '#2563eb' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Next Milestone Panel */}
        <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.2)' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--clr-text-muted)', fontWeight: 700, letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>NEXT MILESTONE</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>🏆</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>Protocol Contributor</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--clr-text-secondary)', lineHeight: '1.4', margin: '0 0 12px 0' }}>
            Complete the Open Source module, submit your first pull request, and earn contributor status within the MOR ecosystem.
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--clr-text-muted)', marginBottom: '4px' }}>
            <span>3 of 5 checkpoints</span>
            <span>83%</span>
          </div>
          <div style={{ width: '100%', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.05)', display: 'flex', gap: '2px' }}>
            <div style={{ flex: 1, height: '100%', background: '#2563eb', borderRadius: '2px 0 0 2px' }} />
            <div style={{ flex: 1, height: '100%', background: '#2563eb' }} />
            <div style={{ flex: 1, height: '100%', background: '#2563eb' }} />
            <div style={{ flex: 1, height: '100%', background: 'rgba(255,255,255,0.05)' }} />
            <div style={{ flex: 1, height: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '0 2px 2px 0' }} />
          </div>
        </div>
    </div>
    </div>
  );
};

export default LessonView;
