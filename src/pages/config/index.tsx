import React, { useState, useCallback } from 'react';
import { View, Text, Image, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import ConfigSection from '@/components/ConfigSection';
import { bannerList as mockBanners } from '@/data/banners';
import { hotRecommendations as mockHot } from '@/data/hot-recommendations';
import { sensitiveWords as mockWords } from '@/data/sensitive-words';
import type { BannerItem, HotRecommendation, SensitiveWord } from '@/types/admin';
import styles from './index.module.scss';

const ConfigPage: React.FC = () => {
  const [banners, setBanners] = useState<BannerItem[]>(mockBanners);
  const [hotList, setHotList] = useState<HotRecommendation[]>(mockHot);
  const [words, setWords] = useState<SensitiveWord[]>(mockWords);
  const [newWord, setNewWord] = useState('');
  const [newCategory, setNewCategory] = useState('');

  const toggleBanner = useCallback((id: string) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, active: !b.active } : b))
    );
    Taro.showToast({ title: '状态已更新', icon: 'success' });
  }, []);

  const deleteBanner = useCallback((id: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定删除该Banner吗？',
      confirmColor: '#f53f3f',
      success: (res) => {
        if (res.confirm) {
          setBanners((prev) => prev.filter((b) => b.id !== id));
          Taro.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  }, []);

  const toggleHot = useCallback((id: string) => {
    setHotList((prev) =>
      prev.map((h) => (h.id === id ? { ...h, active: !h.active } : h))
    );
    Taro.showToast({ title: '状态已更新', icon: 'success' });
  }, []);

  const deleteHot = useCallback((id: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定删除该推荐吗？',
      confirmColor: '#f53f3f',
      success: (res) => {
        if (res.confirm) {
          setHotList((prev) => prev.filter((h) => h.id !== id));
          Taro.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  }, []);

  const deleteWord = useCallback((id: string) => {
    setWords((prev) => prev.filter((w) => w.id !== id));
    Taro.showToast({ title: '已删除', icon: 'success' });
  }, []);

  const addWord = useCallback(() => {
    if (!newWord.trim() || !newCategory.trim()) {
      Taro.showToast({ title: '请填写完整', icon: 'none' });
      return;
    }
    const word: SensitiveWord = {
      id: `sw${Date.now()}`,
      word: newWord.trim(),
      category: newCategory.trim(),
      createdAt: new Date().toISOString().slice(0, 10)
    };
    setWords((prev) => [...prev, word]);
    setNewWord('');
    setNewCategory('');
    Taro.showToast({ title: '已添加', icon: 'success' });
    console.info('[Config]', 'Sensitive word added:', word.word);
  }, [newWord, newCategory]);

  return (
    <View className={styles.page}>
      <ConfigSection title='Banner管理' count={banners.length} actionText='添加'>
        {banners.map((banner) => (
          <View key={banner.id} className={styles.bannerItem}>
            <Image className={styles.bannerCover} src={banner.imageUrl} mode='aspectFill' />
            <View className={styles.bannerInfo}>
              <Text className={styles.bannerTitle}>{banner.title}</Text>
              <Text className={styles.bannerSort}>排序: {banner.sort}</Text>
            </View>
            <View className={styles.bannerActions}>
              <View
                className={classnames(styles.toggleBtn, banner.active ? styles.toggleOn : styles.toggleOff)}
                onClick={() => toggleBanner(banner.id)}
              >
                <Text className={styles.toggleText}>{banner.active ? '启用' : '禁用'}</Text>
              </View>
              <View className={styles.deleteBtn} onClick={() => deleteBanner(banner.id)}>
                <Text className={styles.deleteText}>删除</Text>
              </View>
            </View>
          </View>
        ))}
      </ConfigSection>

      <ConfigSection title='热门推荐' count={hotList.length} actionText='添加'>
        <View className={styles.hotList}>
          {hotList.map((item) => (
            <View key={item.id} className={styles.hotItem}>
              <Image className={styles.hotCover} src={item.coverImage} mode='aspectFill' />
              <Text className={styles.hotTitle}>{item.title}</Text>
              <View className={styles.hotActions}>
                <View
                  className={classnames(styles.toggleBtn, item.active ? styles.toggleOn : styles.toggleOff)}
                  onClick={() => toggleHot(item.id)}
                >
                  <Text className={styles.toggleText}>{item.active ? '启用' : '禁用'}</Text>
                </View>
                <View className={styles.deleteBtn} onClick={() => deleteHot(item.id)}>
                  <Text className={styles.deleteText}>删除</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ConfigSection>

      <ConfigSection title='敏感词库' count={words.length}>
        <View className={styles.wordList}>
          {words.map((item) => (
            <View key={item.id} className={styles.wordTag}>
              <Text className={styles.wordText}>{item.word}</Text>
              <Text className={styles.wordCategory}>{item.category}</Text>
              <View className={styles.wordDelete} onClick={() => deleteWord(item.id)}>
                <Text className={styles.wordDeleteText}>✕</Text>
              </View>
            </View>
          ))}
        </View>
        <View className={styles.addArea}>
          <Input
            className={styles.addInput}
            placeholder='敏感词'
            value={newWord}
            onInput={(e) => setNewWord(e.detail.value)}
          />
          <Input
            className={styles.categoryInput}
            placeholder='分类'
            value={newCategory}
            onInput={(e) => setNewCategory(e.detail.value)}
          />
          <View className={styles.addBtn} onClick={addWord}>
            <Text className={styles.addBtnText}>添加</Text>
          </View>
        </View>
      </ConfigSection>
    </View>
  );
};

export default ConfigPage;
