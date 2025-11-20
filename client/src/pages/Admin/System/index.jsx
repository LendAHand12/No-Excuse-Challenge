import Loading from '@/components/Loading';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tree, TreeNode } from 'react-organizational-chart';
import { ToastContainer, toast } from 'react-toastify';
import TreeMenu from 'react-simple-tree-menu';
import User from '@/api/User';
import './index.css';
import { useParams } from 'react-router-dom';
import DefaultLayout from '../../../layout/DefaultLayout';

const colors = [
  '#149af6',
  '#149af6',
  '#149af6',
  '#149af6',
  '#149af6',
  '#149af6',
  '#149af6',
  '#149af6',
  '#149af6',
  '#149af6',
];

const AdminSystemPage = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const [showType, setShowType] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingItem, setLoadingItem] = useState('');
  const [treeData, setTreeData] = useState({});
  const [treeDataView, setTreeDataView] = useState([]);
  const [clickedKeys, setClickedKeys] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [currentTier, setCurrentTier] = useState(1);

  useEffect(() => {
    (async () => {
      await User.getUserById(id)
        .then((response) => {
          setLoading(false);
          setUserInfo(response.data);
        })
        .catch((error) => {
          let message =
            error.response && error.response.data.error
              ? error.response.data.error
              : error.message;
          toast.error(t(message));
          setLoading(false);
        });
    })();
  }, [id]);

  const StyledNode = useCallback(
    ({
      children,
      onClick,
      layer,
      isRed,
      isYellow,
      isBlue,
      isPink,
      isBrown,
      indexOnLevel,
      totalChild,
      income,
    }) => {
      return (
        <div
          onClick={onClick}
          className={`relative cursor-pointer p-3 text-white text-sm rounded-md inline-block`}
          style={{
            backgroundColor: isRed
              ? '#ee0000'
              : isBrown
              ? '#663300'
              : isBlue
              ? // ? '#149af6'
                '#0033ff'
              : isYellow
              ? '#ffcc00'
              : isPink
              ? '#ff3399'
              : layer <= userInfo.currentLayer[currentTier - 1]
              ? colors[userInfo.currentLayer[currentTier - 1]]
              : '#009933',
          }}
        >
          <div className="flex flex-col items-center">
            <span>{children}</span>
            <span>
              ({totalChild} - {income})
            </span>
            {indexOnLevel && (
              <div className="mt-2 bg-white border border-gray-900 rounded-full text-black w-8 h-8 flex justify-center items-center">
                {indexOnLevel}
              </div>
            )}
          </div>
        </div>
      );
    },
    [userInfo, currentTier],
  );

  const TreeNodeItem = ({ node, onClick }) => {
    return (
      <TreeNode
        label={
          <StyledNode
            layer={node.layer}
            onClick={() => onClick(node.key, node.layer, node.isSubId)}
            isRed={node.isRed}
            isYellow={node.isYellow}
            isBlue={node.isBlue}
            isPink={node.isPink}
            indexOnLevel={node.indexOnLevel}
            totalChild={node.totalChild}
            income={node.income}
            isBrown={node.isBrown}
          >
            {node.label}
          </StyledNode>
        }
      >
        {node.nodes &&
          node.nodes.length > 0 &&
          node.nodes.map((ele) => (
            <TreeNodeItem key={ele.key} node={ele} onClick={onClick} />
          ))}
      </TreeNode>
    );
  };

  const handleNodeItemClick = useCallback(
    async (id, layer, isSubId) => {
      if (loadingItem) {
        toast.error(t('Getting data.Please wait'));
      } else {
        setLoadingItem(true);
        await User.getChildsOfUserForTree({ id, currentTier, isSubId })
          .then((response) => {
            setLoadingItem(false);
            const cloneTreeData = { ...treeData };
            const newTreeData = handleFindAndPushChild(
              id,
              response.data.nodes.map((ele) => ({ ...ele, layer: layer + 1 })),
              cloneTreeData,
            );
            setTreeData(newTreeData);
            setClickedKeys(id);
          })
          .catch((error) => {
            let message =
              error.response && error.response.data.message
                ? error.response.data.message
                : error.message;
            toast.error(t(message));
            setLoadingItem(false);
          });
      }
    },
    [treeData, currentTier],
  );

  const handleFindAndPushChild = (id, newChildren, cloneTreeData) => {
    if (cloneTreeData.key === id) {
      return { ...cloneTreeData, nodes: newChildren };
    } else if (cloneTreeData.nodes && cloneTreeData.nodes.length > 0) {
      const updatedChildren = cloneTreeData.nodes.map((child) =>
        handleFindAndPushChild(id, newChildren, child),
      );
      return { ...cloneTreeData, nodes: updatedChildren };
    }
    return cloneTreeData;
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await User.getChildsOfUserForTree({ id, currentTier })
        .then((response) => {
          setLoading(false);
          setClickedKeys([response.data.key]);
          setTreeData({
            ...response.data,
            nodes: response.data.nodes.map((ele) => ({ ...ele, layer: 1 })),
          });
        })
        .catch((error) => {
          let message =
            error.response && error.response.data.message
              ? error.response.data.message
              : error.message;
          toast.error(t(message));
          setTreeData({});
          setLoading(false);
        });
    })();
  }, [currentTier]);

  useEffect(() => {
    setTreeDataView([treeData]);
  }, [treeData]);

  return (
    <DefaultLayout>
      <ToastContainer />
      <div className="py-24 px-10">
        {userInfo && (
          <div className="flex items-center gap-4">
            {[...Array(userInfo.tier)].map((item, i) => (
              <button
                key={i}
                onClick={() => setCurrentTier(i + 1)}
                className={`flex justify-center items-center hover:underline font-medium ${
                  currentTier === i + 1 ? 'bg-black text-NoExcuseChallenge' : ''
                } rounded-full my-6 py-4 px-8 border focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out`}
              >
                {t('tier')} {i + 1}
              </button>
            ))}
          </div>
        )}
        {loading ? (
          <div className="flex justify-center">
            <Loading />
          </div>
        ) : treeData.key ? (
          <>
            <button
              onClick={() => setShowType(!showType)}
              className="flex justify-center items-center gap-2 hover:underline bg-black text-NoExcuseChallenge font-bold rounded-full mt-2 mb-6 py-2 px-6 focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
            >
              <svg
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 100 100"
                enableBackground="new 0 0 100 100"
              >
                <path
                  d="M76.5,58.3c0,0.1,0,0.2-0.1,0.2c-0.3,1.1-0.7,2.2-1.1,3.3c-0.5,1.2-1,2.3-1.6,3.4c-1.2,2.2-2.7,4.2-4.5,6
	c-1.7,1.8-3.7,3.4-5.9,4.7c-2.2,1.3-4.5,2.3-7,3c-2.5,0.7-5.1,1.1-7.7,1.1C32.8,80,20,67.2,20,51.3s12.8-28.6,28.6-28.6
	c5.3,0,10.3,1.5,14.6,4c0,0,0,0,0.1,0c2.1,1.2,4,2.7,5.6,4.4c0.5,0.4,0.8,0.7,1.2,1.2c0.9,0.8,1.6,0.3,1.6-0.9V22c0-1.1,0.9-2,2-2h4
	c1.1,0,2,0.9,2.2,2v24.5c0,0.9-0.8,1.8-1.8,1.8H53.6c-1.1,0-1.9-0.8-1.9-1.9v-4.2c0-1.1,0.9-2,2-2h9.4c0.8,0,1.4-0.2,1.7-0.7
	c-3.6-5-9.6-8.3-16.2-8.3c-11.1,0-20.1,9-20.1,20.1s9,20.1,20.1,20.1c8.7,0,16.1-5.5,18.9-13.3c0,0,0.3-1.8,1.7-1.8
	c1.4,0,4.8,0,5.7,0c0.8,0,1.6,0.6,1.6,1.5C76.5,58,76.5,58.1,76.5,58.3z"
                />
              </svg>
              <span>Change View</span>
            </button>
            {loadingItem && (
              <div
                className="flex items-center text-white text-sm px-4 py-3 mb-4"
                role="alert"
              >
                <svg
                  className="fill-current w-4 h-4 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M12.432 0c1.34 0 2.01.912 2.01 1.957 0 1.305-1.164 2.512-2.679 2.512-1.269 0-2.009-.75-1.974-1.99C9.789 1.436 10.67 0 12.432 0zM8.309 20c-1.058 0-1.833-.652-1.093-3.524l1.214-5.092c.211-.814.246-1.141 0-1.141-.317 0-1.689.562-2.502 1.117l-.528-.88c2.572-2.186 5.531-3.467 6.801-3.467 1.057 0 1.233 1.273.705 3.23l-1.391 5.352c-.246.945-.141 1.271.106 1.271.317 0 1.357-.392 2.379-1.207l.6.814C12.098 19.02 9.365 20 8.309 20z" />
                </svg>
                <p>{t('Getting data')}...</p>
              </div>
            )}
            {showType ? (
              <div className="w-full overflow-auto">
                <Tree
                  lineWidth={'10px'}
                  lineColor={'brown'}
                  lineBorderRadius={'10px'}
                  label={
                    <StyledNode
                      layer={userInfo?.currentLayer}
                      income={treeData.income}
                      totalChild={treeData.totalChild}
                    >
                      {treeData.label}
                    </StyledNode>
                  }
                >
                  {treeData.nodes &&
                    treeData.nodes.length > 0 &&
                    treeData.nodes.map((child) => (
                      <TreeNodeItem
                        key={child.key}
                        node={child}
                        onClick={handleNodeItemClick}
                      />
                    ))}
                </Tree>
              </div>
            ) : (
              <TreeMenu
                hasSearch={false}
                data={treeDataView}
                onClickItem={(item) => {
                  const key =
                    item.key.split('/')[item.key.split('/').length - 1];
                  !clickedKeys.includes(key) &&
                    handleNodeItemClick(key, item.layer, item.isSubId);
                }}
              ></TreeMenu>
            )}
          </>
        ) : (
          ''
        )}
      </div>
    </DefaultLayout>
  );
};

export default AdminSystemPage;
